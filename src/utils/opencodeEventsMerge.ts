export type MergedOpencodePart = {
  id: string;
  partType: string | null;
  text?: string;
  toolName?: string | null;
  toolStatus?: string | null;
  title?: string | null;
  content?: string | null;
  payload: Record<string, unknown>;
};

export type MergedOpencodeMessage = {
  messageId: string;
  role: string;
  info: Record<string, unknown>;
  parts: MergedOpencodePart[];
};

type OpencodeRow = API.OpencodeEventRead;

type MessageAcc = {
  info?: Record<string, unknown>;
  parts: Map<string, MergedOpencodePart>;
  partOrder: string[];
};

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** SSE 落库常见两种形态：{ part } 或 { properties: { part } } */
export function extractPartObjectFromPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const direct = payload.part;
  if (record(direct)) return direct;
  const props = payload.properties;
  if (record(props) && record(props.part)) {
    return props.part as Record<string, unknown>;
  }
  return undefined;
}

/** message.updated：`info` 在根上或 `properties.info`（OpenCode SSE 落库形态） */
export function extractMessageInfoFromPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const direct = payload.info;
  const props = payload.properties;
  const fromProps =
    record(props) && record(props.info)
      ? (props.info as Record<string, unknown>)
      : undefined;
  const fromDirect = record(direct)
    ? (direct as Record<string, unknown>)
    : undefined;
  if (!fromDirect && !fromProps) return undefined;
  return { ...fromDirect, ...fromProps };
}

/**
 * 将按行存储的 OpenCode SSE 事件合并为按 message_id 的消息视图（与 opencode web 的 message+parts 结构一致）。
 * 仅消费 message.updated / message.part.updated；展示侧再过滤 user。
 */
export function mergeOpencodeEvents(
  rows: OpencodeRow[],
): MergedOpencodeMessage[] {
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const byMessage = new Map<string, MessageAcc>();
  const messageOrder: string[] = [];

  const ensure = (messageId: string): MessageAcc => {
    let acc = byMessage.get(messageId);
    if (!acc) {
      acc = { parts: new Map(), partOrder: [] };
      byMessage.set(messageId, acc);
    }
    return acc;
  };

  const touchOrder = (messageId: string) => {
    if (!messageOrder.includes(messageId)) {
      messageOrder.push(messageId);
    }
  };

  for (const row of sorted) {
    const mid = row.message_id?.trim();
    if (!mid) continue;

    if (row.event_type === 'message.updated') {
      touchOrder(mid);
      const acc = ensure(mid);
      const payload = record(row.payload) ? row.payload : {};
      const infoRaw = extractMessageInfoFromPayload(payload);
      if (infoRaw) {
        acc.info = { ...acc.info, ...infoRaw };
      }
      continue;
    }

    if (row.event_type === 'message.part.updated') {
      touchOrder(mid);
      const acc = ensure(mid);
      const payload = record(row.payload) ? row.payload : {};
      const partObj = extractPartObjectFromPayload(payload) ?? {};
      const partId = String(row.part_id ?? partObj.id ?? '');
      if (!partId) continue;

      const partType =
        row.part_type ??
        (typeof partObj.type === 'string' ? partObj.type : null);
      const textFromPart =
        typeof partObj.text === 'string' ? partObj.text : undefined;
      const text =
        textFromPart ??
        (typeof row.content === 'string' ? row.content : undefined);

      const prev = acc.parts.get(partId);
      const toolFromPart =
        typeof partObj.tool === 'string' ? partObj.tool : undefined;

      const merged: MergedOpencodePart = {
        id: partId,
        partType,
        text: text ?? prev?.text,
        toolName: row.tool_name ?? toolFromPart ?? prev?.toolName ?? null,
        toolStatus: row.tool_status ?? prev?.toolStatus ?? null,
        title: row.title ?? prev?.title ?? null,
        content: row.content ?? prev?.content ?? null,
        payload: { ...(prev?.payload ?? {}), ...payload },
      };
      acc.parts.set(partId, merged);
      if (!acc.partOrder.includes(partId)) {
        acc.partOrder.push(partId);
      }
    }
  }

  const out: MergedOpencodeMessage[] = [];
  for (const mid of messageOrder) {
    const acc = byMessage.get(mid);
    if (!acc) continue;
    const role = typeof acc.info?.role === 'string' ? acc.info.role : '';
    if (role.toLowerCase() === 'user') {
      continue;
    }
    const parts = acc.partOrder
      .map((pid) => acc.parts.get(pid))
      .filter((p): p is MergedOpencodePart => Boolean(p));
    out.push({
      messageId: mid,
      role: role || 'assistant',
      info: acc.info ?? {},
      parts,
    });
  }
  return out;
}

export type OpencodeStreamItem =
  | { kind: 'retry'; id: number; content: string }
  | { kind: 'message'; id: number; message: MergedOpencodeMessage };

/** 按事件 id 将 assistant 消息与 retry 提醒合并为时间线（用于执行流展示） */
export function buildOpencodeStreamTimeline(
  rows: OpencodeRow[],
): OpencodeStreamItem[] {
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const messageFirstId = new Map<string, number>();

  for (const row of sorted) {
    const mid = row.message_id?.trim();
    if (!mid) continue;
    if (
      row.event_type === 'message.updated' ||
      row.event_type === 'message.part.updated'
    ) {
      if (!messageFirstId.has(mid)) {
        messageFirstId.set(mid, row.id);
      }
    }
  }

  const timeline: OpencodeStreamItem[] = [];

  for (const row of sorted) {
    if (row.event_type === 'retry') {
      const content = (row.content ?? '').trim();
      if (content) {
        timeline.push({ kind: 'retry', id: row.id, content });
      }
    }
  }

  for (const msg of mergeOpencodeEvents(rows)) {
    const firstId = messageFirstId.get(msg.messageId);
    if (firstId != null) {
      timeline.push({ kind: 'message', id: firstId, message: msg });
    }
  }

  timeline.sort((a, b) => a.id - b.id);
  return timeline;
}

export function mergeOpencodeRowsById(
  existing: OpencodeRow[],
  incoming: OpencodeRow[],
): OpencodeRow[] {
  const map = new Map<number, OpencodeRow>();
  for (const r of existing) {
    map.set(r.id, r);
  }
  for (const r of incoming) {
    map.set(r.id, r);
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

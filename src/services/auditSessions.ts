import type {
  AuditChainRawGraph,
  AuditSessionDetailDTO,
} from '@/types/auditSessionDetail';
import { listEventsApiEventsGet } from '@/services/swagger/events';
import { getGraphApiGraphGet } from '@/services/swagger/graph';
import { listLogsApiLogsGet } from '@/services/swagger/logs';
import {
  getTaskApiTasksTaskIdGet,
  listTasksApiTasksGet,
} from '@/services/swagger/tasks';
import { utcApiStringToEpochMs } from '@/utils/utcDateTimeDisplay';

/** 后端 `/api/graph` 返回的图谱（外层可能再包一层 `data`） */
export function normalizeAuditChainGraph(
  payload: unknown,
): AuditChainRawGraph | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const root = payload as Record<string, any>;
  const candidate =
    root.nodes && root.edges
      ? root
      : root.data && typeof root.data === 'object'
        ? (root.data as Record<string, any>)
        : null;
  if (!candidate) {
    return null;
  }
  const rawNodes = Array.isArray(candidate.nodes) ? candidate.nodes : [];
  const rawEdges = Array.isArray(candidate.edges) ? candidate.edges : [];
  if (rawNodes.length === 0 && rawEdges.length === 0) {
    return null;
  }
  return {
    nodes: rawNodes.map((n: any, index: number) => ({
      elementId: String(n?.elementId ?? n?.id ?? `node-${index}`),
      labels: Array.isArray(n?.labels)
        ? n.labels.map((l: unknown) => String(l))
        : [],
      props:
        n?.props && typeof n.props === 'object'
          ? (n.props as Record<string, any>)
          : {},
    })),
    edges: rawEdges.map((e: any, index: number) => ({
      elementId: String(e?.elementId ?? e?.id ?? `edge-${index}`),
      type: String(e?.type ?? e?.relationship ?? 'FLOW'),
      start: String(e?.start ?? e?.source ?? ''),
      end: String(e?.end ?? e?.target ?? ''),
      props:
        e?.props && typeof e.props === 'object'
          ? (e.props as Record<string, any>)
          : {},
    })),
  };
}

/**
 * 单独拉取 `/api/graph` 并归一化；失败时返回 null。
 * 供轮询期间在「检测到新事件」后增量刷新审计链路图使用。
 */
export async function fetchAuditChainGraph(
  taskId: string,
): Promise<AuditChainRawGraph | null> {
  try {
    const res = await getGraphApiGraphGet({
      task_id: taskId,
      depth: 10,
      limit: 2000,
    });
    return normalizeAuditChainGraph(res?.data ?? res);
  } catch {
    return null;
  }
}

/**
 * 计算审计链路图的稳定指纹，用于判断「相比上次是否真的有变化」。
 *
 * 节点 / 边按 `elementId` 排序，仅序列化前端会展示或用于交互的字段，
 * 避免后端无关字段抖动触发不必要的画布更新。
 */
export function auditChainGraphFingerprint(
  graph: AuditChainRawGraph | null,
): string {
  if (!graph) return '';
  const nodes = [...graph.nodes]
    .sort((a, b) => a.elementId.localeCompare(b.elementId))
    .map((n) => [n.elementId, n.labels, n.props] as const);
  const edges = [...graph.edges]
    .sort((a, b) => a.elementId.localeCompare(b.elementId))
    .map((e) => [e.elementId, e.type, e.start, e.end] as const);
  return JSON.stringify({ n: nodes, e: edges });
}

/** 将单条事件 API 结果映射为详情页事件行 + 工具调用行（与列表聚合逻辑一致） */
export function mapEventReadToDetailEventAndToolCall(e: API.EventRead): {
  event: AuditSessionDetailDTO['events'][number];
  toolCall: AuditSessionDetailDTO['toolCalls'][number];
} {
  return {
    event: {
      id: String(e.id),
      taskId: e.task_id ?? undefined,
      module: e.module ?? '',
      actionType: e.action_type ?? '',
      toolName: e.tool_name ?? '',
      status: e.status ?? '',
      reason: e.reason ?? '',
      finalStatus: e.final_status ?? '',
      startedAt: e.started_at,
      finishedAt: e.finished_at ?? undefined,
      llmInputDelta: e.llm_input_delta ?? 0,
      llmOutputDelta: e.llm_output_delta ?? 0,
      codeAgentInputDelta: e.code_agent_input_delta ?? 0,
      codeAgentOutputDelta: e.code_agent_output_delta ?? 0,
      detail: e.detail
        ? {
            toolArguments: e.detail.tool_arguments ?? undefined,
            toolOutput: e.detail.tool_output ?? undefined,
            codeAgentChainOfThought:
              e.detail.code_agent_chain_of_thought ?? undefined,
          }
        : undefined,
    },
    toolCall: {
      id: String(e.id),
      name: e.tool_name || '-',
      time: e.started_at,
      inputSummary: JSON.stringify(e.detail?.tool_arguments ?? {}),
      outputSummary: (e.detail?.tool_output ?? '').slice(0, 120),
      fullInput: JSON.stringify(e.detail?.tool_arguments ?? {}, null, 2),
      fullOutput: e.detail?.tool_output ?? '',
      status: e.status,
      durationMs:
        e.finished_at && e.started_at
          ? Math.max(
              0,
              (utcApiStringToEpochMs(e.finished_at) ?? 0) -
                (utcApiStringToEpochMs(e.started_at) ?? 0),
            )
          : 0,
    },
  };
}

export type SessionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AuditSessionItem = {
  id: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  status: SessionStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  success: boolean;
};

function normalizeStatus(status?: string): SessionStatus {
  switch (status) {
    case 'pending':
    case 'running':
    case 'completed':
    case 'failed':
    case 'cancelled':
      return status;
    default:
      return 'pending';
  }
}

export async function listAuditSessions(params: {
  current?: number;
  pageSize?: number;
  taskName?: string;
  projectId?: string;
  status?: SessionStatus;
}) {
  const res = await listTasksApiTasksGet({
    current: params.current,
    pageSize: params.pageSize,
    status: params.status,
    project_id: params.projectId,
  });

  const tasks = res?.data ?? [];
  const filtered = params.taskName
    ? tasks.filter((task) => task.name.includes(params.taskName as string))
    : tasks;

  const mapped: AuditSessionItem[] = filtered.map((task) => ({
    id: task.id,
    taskId: task.id,
    taskName: task.name,
    projectId: task.project_id,
    projectName: task.project_id,
    status: normalizeStatus(task.status),
    createdAt: task.created_at,
    startedAt: task.created_at,
    endedAt: task.finished_at ?? undefined,
  }));

  return {
    success: res?.success ?? true,
    total: res?.total ?? mapped.length,
    data: mapped,
  } satisfies PageResult<AuditSessionItem>;
}

/** 按 task_id + 末尾事件 id 增量拉取，合并为完整列表（直至某次无新数据） */
async function fetchAllTaskEventsIncremental(taskId: string): Promise<API.EventRead[]> {
  const all: API.EventRead[] = [];
  let afterEventId: number | undefined;
  const maxRounds = 500;

  for (let round = 0; round < maxRounds; round += 1) {
    const res = await listEventsApiEventsGet(
      afterEventId === undefined
        ? { task_id: taskId }
        : { task_id: taskId, after_id: afterEventId },
    );
    const batch = Array.isArray(res?.data) ? res.data : [];
    if (batch.length === 0) {
      break;
    }
    all.push(...batch);
    const maxId = Math.max(...batch.map((e) => e.id));
    if (maxId <= (afterEventId ?? -1)) {
      break;
    }
    afterEventId = maxId;
  }

  return all;
}

/** 从指定事件 id 之后增量拉取（每轮带 after_id，直至无新数据） */
async function fetchTaskEventsSince(
  taskId: string,
  sinceId: number,
): Promise<API.EventRead[]> {
  const all: API.EventRead[] = [];
  let afterEventId = sinceId;
  const maxRounds = 500;

  for (let round = 0; round < maxRounds; round += 1) {
    const res = await listEventsApiEventsGet({
      task_id: taskId,
      after_id: afterEventId,
    });
    const batch = Array.isArray(res?.data) ? res.data : [];
    if (batch.length === 0) {
      break;
    }
    all.push(...batch);
    const maxId = Math.max(...batch.map((e) => e.id));
    if (maxId <= afterEventId) {
      break;
    }
    afterEventId = maxId;
  }

  return all;
}

export type GetAuditSessionDetailOptions = {
  /** 当前已加载的最大事件数字 id；传入时只拉该 id 之后的新事件（轮询用） */
  afterEventId?: number;
};

export type GetAuditSessionDetailResult =
  | { success: false; data: null }
  | { success: true; data: AuditSessionDetailDTO; partialEvents: boolean };

/** 将增量接口返回的 detail 合并进已有详情（事件/工具调用按 id 去重） */
export function mergeAuditSessionDetailDelta(
  prev: AuditSessionDetailDTO,
  next: AuditSessionDetailDTO,
): AuditSessionDetailDTO {
  const eventById = new Map(prev.events.map((e) => [e.id, e]));
  for (const e of next.events) {
    eventById.set(e.id, e);
  }
  const mergedEvents = [...eventById.values()].sort(
    (a, b) =>
      (utcApiStringToEpochMs(a.startedAt) ?? 0) -
      (utcApiStringToEpochMs(b.startedAt) ?? 0),
  );

  const toolById = new Map(prev.toolCalls.map((t) => [t.id, t]));
  for (const t of next.toolCalls) {
    toolById.set(t.id, t);
  }
  const mergedToolCalls = [...toolById.values()].sort(
    (a, b) =>
      (utcApiStringToEpochMs(a.time) ?? 0) -
      (utcApiStringToEpochMs(b.time) ?? 0),
  );

  return {
    ...next,
    events: mergedEvents,
    toolCalls: mergedToolCalls,
    auditChainGraph: next.auditChainGraph ?? prev.auditChainGraph,
  };
}

export async function getAuditSessionDetail(
  taskId: string,
  options?: GetAuditSessionDetailOptions,
): Promise<GetAuditSessionDetailResult> {
  const afterCursor = options?.afterEventId;
  const eventsPromise =
    afterCursor === undefined
      ? fetchAllTaskEventsIncremental(taskId)
      : fetchTaskEventsSince(taskId, afterCursor);

  const [taskRes, events, logsRes, graphRes] = await Promise.all([
    getTaskApiTasksTaskIdGet({ task_id: taskId }),
    eventsPromise,
    listLogsApiLogsGet({ task_id: taskId, current: 1, pageSize: 200 }),
    afterCursor === undefined
      ? getGraphApiGraphGet({ task_id: taskId, depth: 10, limit: 2000 }).catch(
          () => null,
        )
      : Promise.resolve(null),
  ]);

  const task = taskRes?.data;
  if (!task) {
    return { success: false, data: null };
  }
  const logs = logsRes?.data ?? [];

  const mappedRows = events.map(mapEventReadToDetailEventAndToolCall);
  const eventRecords = mappedRows.map((r) => r.event);
  const toolCalls = mappedRows.map((r) => r.toolCall);

  const todos = (task.todo ?? []).map((todo, index) => ({
    id: String((todo as { id?: string }).id ?? index + 1),
    text: String((todo as { content?: string }).content ?? ''),
    done: (todo as { status?: string }).status === 'completed',
  }));

  const data: AuditSessionDetailDTO = {
    session: {
      id: task.id,
      taskId: task.id,
      taskName: task.name,
      projectName: task.project_id,
      status: task.status,
      createdAt: task.created_at,
      startedAt: task.created_at,
      endedAt: task.finished_at ?? undefined,
      tokenMainLlm:
        (task.llm_input_token ?? 0) + (task.llm_output_token ?? 0),
      tokenAgent:
        (task.code_agent_input_token ?? 0) + (task.code_agent_output_token ?? 0),
      tokenTotal:
        (task.llm_input_token ?? 0) +
        (task.llm_output_token ?? 0) +
        (task.code_agent_input_token ?? 0) +
        (task.code_agent_output_token ?? 0),
    },
    events: eventRecords,
    toolCalls,
    todos,
    tokenUsage: {
      mainLlm: {
        input: task.llm_input_token ?? 0,
        output: task.llm_output_token ?? 0,
      },
      agent: {
        input: task.code_agent_input_token ?? 0,
        output: task.code_agent_output_token ?? 0,
      },
    },
    logs: logs
      .map((log) => `[${log.created_at}] [${log.level}] ${log.message}`)
      .join('\n'),
    auditChainGraph: normalizeAuditChainGraph(graphRes?.data ?? graphRes),
  };

  return {
    success: true,
    data,
    partialEvents: afterCursor !== undefined,
  };
}

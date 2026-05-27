import type { MergedOpencodePart } from '@/utils/opencodeEventsMerge';
import { extractPartObjectFromPayload } from '@/utils/opencodeEventsMerge';

const CONTEXT_GROUP_TOOLS = new Set(['read', 'glob', 'grep', 'list']);
const HIDDEN_TOOLS = new Set(['todowrite']);

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function basenamePath(p: string): string {
  const s = p.replace(/\\/g, '/');
  const i = s.lastIndexOf('/');
  return i >= 0 ? s.slice(i + 1) : s;
}

export function dirnamePath(p: string): string {
  const s = p.replace(/\\/g, '/');
  const i = s.lastIndexOf('/');
  return i > 0 ? s.slice(0, i) : '';
}

/** 从合并后的 SSE part 中解析 opencode 工具结构（对齐 ToolPart.state） */
export function getToolFromMergedPart(part: MergedOpencodePart): {
  tool: string;
  input: Record<string, unknown>;
  metadata: Record<string, unknown>;
  output?: string;
  error?: string;
  status?: string;
  stateTitle?: string;
} {
  const payloadRec = record(part.payload) ? part.payload : {};
  const embedded = extractPartObjectFromPayload(payloadRec);
  const toolRaw =
    (part.toolName && String(part.toolName).trim()) ||
    (embedded && typeof embedded.tool === 'string' ? embedded.tool : '') ||
    '';
  const tool = toolRaw.toLowerCase();

  let state: Record<string, unknown> | undefined;
  if (embedded && record(embedded.state)) {
    state = embedded.state as Record<string, unknown>;
  } else if (record(part.payload.state)) {
    state = part.payload.state as Record<string, unknown>;
  }

  const input =
    state && record(state.input)
      ? (state.input as Record<string, unknown>)
      : {};
  const metadata =
    state && record(state.metadata)
      ? (state.metadata as Record<string, unknown>)
      : {};
  const output = typeof state?.output === 'string' ? state.output : undefined;
  const error = typeof state?.error === 'string' ? state.error : undefined;
  const status =
    (typeof state?.status === 'string' ? state.status : undefined) ||
    (part.toolStatus ? String(part.toolStatus) : undefined);
  const stateTitle = typeof state?.title === 'string' ? state.title : undefined;

  return { tool, input, metadata, output, error, status, stateTitle };
}

/** 工具是否处于运行/等待状态（用于决定是否动画/禁止展开） */
export function isToolPending(part: MergedOpencodePart): boolean {
  const { status } = getToolFromMergedPart(part);
  return status === 'pending' || status === 'running';
}

export function isContextGroupToolPart(part: MergedOpencodePart): boolean {
  if ((part.partType || '').toLowerCase() !== 'tool') return false;
  const { tool } = getToolFromMergedPart(part);
  return CONTEXT_GROUP_TOOLS.has(tool);
}

export function shouldHideToolPart(part: MergedOpencodePart): boolean {
  if ((part.partType || '').toLowerCase() !== 'tool') return false;
  const { tool, status } = getToolFromMergedPart(part);
  if (HIDDEN_TOOLS.has(tool)) return true;
  if (tool === 'question' && (status === 'pending' || status === 'running')) {
    return true;
  }
  return false;
}

export type ContextToolTrigger = {
  title: string;
  subtitle?: string;
  args?: string[];
};

/** 对齐 opencode contextToolTrigger 的标题/副标题/参数 */
export function buildContextToolTrigger(
  part: MergedOpencodePart,
): ContextToolTrigger {
  const { tool, input } = getToolFromMergedPart(part);
  const filePath =
    typeof input.filePath === 'string' ? input.filePath : undefined;
  const path = typeof input.path === 'string' ? input.path : '/';
  const pattern = typeof input.pattern === 'string' ? input.pattern : undefined;
  const include = typeof input.include === 'string' ? input.include : undefined;
  const offset = typeof input.offset === 'number' ? input.offset : undefined;
  const limit = typeof input.limit === 'number' ? input.limit : undefined;

  switch (tool) {
    case 'read': {
      const args: string[] = [];
      if (offset !== undefined) args.push(`offset=${offset}`);
      if (limit !== undefined) args.push(`limit=${limit}`);
      return {
        title: 'Read',
        subtitle: filePath ? basenamePath(filePath) : '',
        args,
      };
    }
    case 'list':
      return { title: 'List', subtitle: path };
    case 'glob':
      return {
        title: 'Glob',
        subtitle: path,
        args: pattern ? [`pattern=${pattern}`] : [],
      };
    case 'grep': {
      const args: string[] = [];
      if (pattern) args.push(`pattern=${pattern}`);
      if (include) args.push(`include=${include}`);
      return { title: 'Grep', subtitle: path, args };
    }
    default:
      return { title: tool || 'tool' };
  }
}

/** 分组标题，例如：已探索 / 探索中 — 6 次读取 · 2 次搜索 */
export function summarizeContextToolGroup(
  parts: MergedOpencodePart[],
  busy = false,
): { primary: string; secondary?: string } {
  let read = 0;
  let search = 0;
  let list = 0;
  for (const p of parts) {
    const { tool } = getToolFromMergedPart(p);
    if (tool === 'read') read += 1;
    else if (tool === 'glob' || tool === 'grep') search += 1;
    else if (tool === 'list') list += 1;
  }
  const bits: string[] = [];
  if (read) bits.push(`${read} 次读取`);
  if (search) bits.push(`${search} 次搜索`);
  if (list) bits.push(`${list} 次列出`);
  return {
    primary: busy ? '探索中' : '已探索',
    secondary: bits.join(' · ') || undefined,
  };
}

export type OpencodeDisplaySegment =
  | { kind: 'text'; part: MergedOpencodePart }
  | { kind: 'reasoning'; part: MergedOpencodePart }
  | { kind: 'context_tools'; parts: MergedOpencodePart[] }
  | { kind: 'tool'; part: MergedOpencodePart }
  | { kind: 'other'; part: MergedOpencodePart };

function isRenderableTextPart(part: MergedOpencodePart): boolean {
  if ((part.partType || '').toLowerCase() !== 'text') return true;
  const body = (part.text ?? part.content ?? '').trim();
  return Boolean(body);
}

export function buildOpencodeDisplaySegments(
  parts: MergedOpencodePart[],
): OpencodeDisplaySegment[] {
  const filtered = parts.filter(
    (p) => !shouldHideToolPart(p) && isRenderableTextPart(p),
  );
  const result: OpencodeDisplaySegment[] = [];
  let contextBuf: MergedOpencodePart[] = [];

  const flushContext = () => {
    if (contextBuf.length) {
      result.push({ kind: 'context_tools', parts: [...contextBuf] });
      contextBuf = [];
    }
  };

  for (const part of filtered) {
    const pt = (part.partType || '').toLowerCase();
    if (pt === 'text' || pt === 'reasoning') {
      flushContext();
      result.push({ kind: pt, part });
      continue;
    }
    if (pt === 'tool') {
      if (isContextGroupToolPart(part)) {
        contextBuf.push(part);
      } else {
        flushContext();
        result.push({ kind: 'tool', part });
      }
      continue;
    }
    flushContext();
    result.push({ kind: 'other', part });
  }
  flushContext();
  return result;
}

/** 单行工具摘要（非 read/glob/grep/list 分组内） */
export type StandaloneToolHeadline = {
  primary: string;
  secondary?: string;
  filename?: string;
  directory?: string;
  url?: string;
};

export function formatStandaloneToolHeadline(
  part: MergedOpencodePart,
): StandaloneToolHeadline {
  const { tool, input, stateTitle } = getToolFromMergedPart(part);
  switch (tool) {
    case 'bash': {
      const desc =
        typeof input.description === 'string' ? input.description : '';
      const cmd =
        typeof input.command === 'string' ? input.command.slice(0, 200) : '';
      return {
        primary: 'Shell',
        secondary: desc || cmd || stateTitle,
      };
    }
    case 'write':
    case 'edit':
    case 'apply_patch': {
      const path =
        typeof input.filePath === 'string'
          ? input.filePath
          : typeof input.path === 'string'
            ? input.path
            : '';
      const labelMap: Record<string, string> = {
        write: 'Write',
        edit: 'Edit',
        apply_patch: 'Patch',
      };
      return {
        primary: labelMap[tool] ?? 'Tool',
        filename: basenamePath(path) || undefined,
        directory: dirnamePath(path) || undefined,
        secondary: stateTitle,
      };
    }
    case 'webfetch': {
      const url = typeof input.url === 'string' ? input.url : '';
      return { primary: 'Fetch', url, secondary: url || stateTitle };
    }
    case 'websearch':
    case 'codesearch': {
      const query = typeof input.query === 'string' ? input.query : '';
      return {
        primary: tool === 'websearch' ? 'Search' : 'Code Search',
        secondary: query || stateTitle,
      };
    }
    case 'task': {
      const subagent =
        typeof input.subagent_type === 'string' ? input.subagent_type : '';
      const d = typeof input.description === 'string' ? input.description : '';
      const primary = subagent
        ? `${subagent.charAt(0).toUpperCase()}${subagent.slice(1)} Agent`
        : 'Subagent';
      return { primary, secondary: d || stateTitle };
    }
    case 'todowrite':
      return { primary: 'Todos' };
    case 'question':
      return { primary: 'Question', secondary: stateTitle };
    case 'skill': {
      const name = typeof input.name === 'string' ? input.name : 'Skill';
      return { primary: name, secondary: stateTitle };
    }
    default: {
      const name = part.title?.trim() || tool || 'Tool';
      const display =
        name.length > 0 ? name.charAt(0).toUpperCase() + name.slice(1) : name;
      return { primary: display, secondary: pickSubtitle(input) || stateTitle };
    }
  }
}

function pickSubtitle(input: Record<string, unknown>): string | undefined {
  const keys = ['description', 'query', 'name', 'pattern'];
  for (const k of keys) {
    const v = input[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}

/** 解析 todowrite 的待办列表 */
export function extractTodos(part: MergedOpencodePart): Array<{
  content: string;
  status: string;
}> {
  const { input, metadata } = getToolFromMergedPart(part);
  const fromMeta = (metadata as { todos?: unknown }).todos;
  const fromInput = (input as { todos?: unknown }).todos;
  const list = Array.isArray(fromMeta)
    ? fromMeta
    : Array.isArray(fromInput)
      ? fromInput
      : [];
  return list
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const o = item as Record<string, unknown>;
      const content = typeof o.content === 'string' ? o.content : '';
      const status = typeof o.status === 'string' ? o.status : 'pending';
      if (!content) return null;
      return { content, status };
    })
    .filter((x): x is { content: string; status: string } => x !== null);
}

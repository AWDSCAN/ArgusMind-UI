import { request } from '@umijs/max';

/** 后端 snake_case 原始类型 */

export type TaskStatsRaw = {
  total: number;
  by_status: Partial<
    Record<
      'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
      number
    >
  >;
};

export type LanguageStatItemRaw = {
  language: string;
  code: number;
  files: number;
  lines: number;
};

export type ProjectOverviewStatsRaw = {
  total_projects: number;
  total_files: number;
  total_lines: number;
  languages: LanguageStatItemRaw[];
  top_by_vulnerabilities: {
    project_id: string;
    project_name: string;
    vulnerability_count: number;
  }[];
};

export type FindingStatsRaw = {
  total: number;
  by_severity: Partial<
    Record<
      'info' | 'low' | 'medium' | 'high' | 'critical' | 'unknown',
      number
    >
  >;
};

/** 漏洞分类统计项（GET /api/findings/stats/by-type） */
export type FindingTypeStatRaw = {
  category_name: string;
  count: number;
};

/** 严重等级（用于风险分布、日趋势，来自 /api/findings/stats 与 daily） */
export type FindingSeverityKey =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'unknown';

export const FINDING_SEVERITY_ORDER: FindingSeverityKey[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
  'unknown',
];

export type DailySeverityStatRaw = {
  date: string;
  info?: number;
  low?: number;
  medium?: number;
  high?: number;
  critical?: number;
  unknown?: number;
};

export type TokenStatsRaw = {
  llm_input: number;
  llm_output: number;
  code_agent_input: number;
  code_agent_output: number;
  total: number;
};

export type DailyTokenStatRaw = {
  date: string;
  llm_input: number;
  llm_output: number;
  code_agent_input: number;
  code_agent_output: number;
  total: number;
};

type Ok<T> = { success: boolean; data: T };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function extractArrayPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  for (const key of ['items', 'list', 'records', 'rows'] as const) {
    const v = data[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

/** 解析 OkResponse（success + data）或仅 data 包裹的对象统计 */
export function unwrapOkData<T>(res: unknown, fallback: T): T {
  if (res == null) return fallback;
  if (!isRecord(res)) return res as T;

  if (res.success === true && 'data' in res) {
    const data = res.data;
    return (data ?? fallback) as T;
  }

  // 无 success 但 data 为业务对象（排除 PageResult 列表）
  if ('data' in res && isRecord(res.data)) {
    return res.data as T;
  }

  return res as T;
}

/** 解析列表：OkResponse.data、PageResult.data 或直接数组 */
export function unwrapListData<T>(res: unknown): T[] {
  if (res == null) return [];
  if (Array.isArray(res)) return res as T[];
  if (!isRecord(res)) return [];

  if (res.success === true && 'data' in res) {
    return extractArrayPayload(res.data) as T[];
  }

  if (Array.isArray(res.data)) {
    return res.data as T[];
  }

  if ('data' in res) {
    return extractArrayPayload(res.data) as T[];
  }

  return [];
}

export async function getTaskStats() {
  return request<Ok<TaskStatsRaw>>('/api/tasks/stats', { method: 'GET' });
}

export async function getProjectOverview() {
  return request<Ok<ProjectOverviewStatsRaw>>('/api/projects/overview', {
    method: 'GET',
  });
}

export async function getFindingStats() {
  return request<Ok<FindingStatsRaw>>('/api/findings/stats', { method: 'GET' });
}

export async function getFindingStatsByType(limit = 5) {
  return request<Ok<FindingTypeStatRaw[]>>('/api/findings/stats/by-type', {
    method: 'GET',
    params: { limit },
  });
}

export async function getFindingStatsDaily(days = 7) {
  return request<Ok<DailySeverityStatRaw[]>>('/api/findings/stats/daily', {
    method: 'GET',
    params: { days },
  });
}

export async function getTokenStats() {
  return request<Ok<TokenStatsRaw>>('/api/tokens/stats', { method: 'GET' });
}

export async function getTokenTrend(days = 7) {
  return request<Ok<DailyTokenStatRaw[]>>('/api/tokens/trend', {
    method: 'GET',
    params: { days },
  });
}

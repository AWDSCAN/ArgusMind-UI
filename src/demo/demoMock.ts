import type { RequestOptions } from '@@/plugin-request/request';
import { DEMO_PROJECT_ID, DEMO_TASK_ID } from './constants';
import {
  demoHumanApprovalByInteractionId,
  demoTaskLogs,
  filterDemoTaskEvents,
  getDemoEventById,
  getDemoOpencodeEvents,
  getDemoTaskGraph,
} from './data/auditSession';
import { demoAuthMe, demoLoginResponse } from './data/auth';
import {
  demoDashboardProjects,
  filterDemoDashboardTasks,
  getDemoTaskById,
} from './data/dashboard';
import {
  getDemoFindingByNeo4jId,
  getDemoFindingDetail,
} from './data/findingDetails';
import { demoFindingsList } from './data/findings';
import { getDemoResultToLanguageGraph } from './data/graph';
import {
  demoFindingsStats,
  demoFindingsStatsByType,
  demoFindingsStatsDaily,
  demoProjectsOverview,
  demoProjectsStats,
  demoTaskCompletionStatus,
  demoTasksStats,
} from './data/stats';
import { demoTask } from './data/task';
import { demoTokensStats, demoTokensTrendSlice } from './data/tokens';

type QueryParams = Record<string, string | string[] | undefined>;

function parseUrl(raw: string): {
  pathname: string;
  searchParams: URLSearchParams;
} {
  try {
    const u = new URL(raw, 'http://demo.local');
    return { pathname: u.pathname, searchParams: u.searchParams };
  } catch {
    const [path, qs] = raw.split('?');
    return {
      pathname: path || raw,
      searchParams: new URLSearchParams(qs ?? ''),
    };
  }
}

function mergeParams(
  urlParams: URLSearchParams,
  configParams?: RequestOptions['params'],
): QueryParams {
  const out: QueryParams = {};
  urlParams.forEach((v, k) => {
    out[k] = v;
  });
  if (configParams && typeof configParams === 'object') {
    for (const [k, v] of Object.entries(configParams)) {
      if (v !== undefined && v !== null) out[k] = String(v);
    }
  }
  return out;
}

function paginate<T>(
  list: T[],
  params: QueryParams,
): { data: T[]; total: number; success: true } {
  const current = Math.max(1, Number(params.current ?? params.page ?? 1) || 1);
  const pageSize = Math.max(
    1,
    Number(params.pageSize ?? params.page_size ?? 10) || 10,
  );
  const start = (current - 1) * pageSize;
  return {
    data: list.slice(start, start + pageSize),
    total: list.length,
    success: true,
  };
}

function filterFindings(params: QueryParams) {
  const taskId = String(params.task_id ?? params.taskId ?? '');
  const projectId = String(params.project_id ?? params.projectId ?? '');
  const severity = String(params.severity ?? params.level ?? '').toLowerCase();
  const status = String(params.status ?? '').toLowerCase();
  const keyword = String(params.keyword ?? '').trim();

  return demoFindingsList.filter((f) => {
    if (taskId && f.task_id !== taskId) return false;
    if (projectId && f.project_id !== projectId) return false;
    if (severity && String(f.level).toLowerCase() !== severity) return false;
    if (status && String(f.status).toLowerCase() !== status) return false;
    if (keyword && !f.vul_name.includes(keyword)) return false;
    return true;
  });
}

function filterTasks(params: QueryParams) {
  return filterDemoDashboardTasks({
    project_id: String(params.project_id ?? params.projectId ?? ''),
    name: String(params.name ?? ''),
  });
}

export function resolveDemoMock(config: RequestOptions): unknown | undefined {
  const method = (config.method ?? 'GET').toUpperCase();
  const rawUrl = String(config.url ?? '');
  const { pathname, searchParams } = parseUrl(rawUrl);
  const params = mergeParams(searchParams, config.params);

  // —— Auth ——
  if (method === 'POST' && pathname === '/api/auth/login') {
    return demoLoginResponse;
  }
  if (method === 'GET' && pathname === '/api/auth/me') {
    return demoAuthMe;
  }
  if (method === 'POST' && pathname === '/api/auth/change-password') {
    return { success: true, data: true };
  }
  if (method === 'POST' && pathname === '/api/auth/logout') {
    return { success: true };
  }

  // —— Tasks ——
  if (method === 'GET' && pathname === '/api/tasks') {
    return paginate(filterTasks(params) as unknown as API.TaskRead[], params);
  }
  if (method === 'GET' && pathname === '/api/tasks/detail') {
    const id = String(params.id ?? '');
    if (id && id !== DEMO_TASK_ID) {
      return { success: false, errorMessage: '任务不存在' };
    }
    return {
      success: true,
      data: { ...demoTask, vulnCount: demoFindingsList.length },
    };
  }
  if (method === 'GET' && pathname === '/api/tasks/options') {
    return {
      success: true,
      data: [{ id: DEMO_TASK_ID, name: demoTask.name }],
    };
  }
  if (method === 'GET' && pathname === '/api/tasks/stats') {
    return demoTasksStats;
  }
  if (
    method === 'GET' &&
    pathname === `/api/tasks/${DEMO_TASK_ID}/completion-status`
  ) {
    return demoTaskCompletionStatus;
  }
  const taskById = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (method === 'GET' && taskById) {
    const id = taskById[1]!;
    const task = getDemoTaskById(id);
    if (!task) {
      return { success: false, errorMessage: '任务不存在' };
    }
    return { success: true, data: task };
  }

  // —— Projects ——
  if (method === 'GET' && pathname === '/api/projects') {
    return paginate(demoDashboardProjects, params);
  }
  if (method === 'GET' && pathname === '/api/projects/detail') {
    const id = String(params.id ?? '');
    const project = demoDashboardProjects.find((p) => p.id === id);
    if (!project) {
      return { success: false, errorMessage: '项目不存在' };
    }
    return { success: true, data: project };
  }
  if (method === 'GET' && pathname === '/api/projects/options') {
    return {
      success: true,
      data: demoDashboardProjects.map((p) => ({ id: p.id, name: p.name })),
    };
  }
  if (method === 'GET' && pathname === '/api/projects/overview') {
    return demoProjectsOverview;
  }
  if (method === 'GET' && pathname === '/api/projects/stats') {
    return demoProjectsStats;
  }

  // —— Findings / 漏洞 ——
  if (method === 'GET' && pathname === '/api/findings') {
    return paginate(filterFindings(params), params);
  }
  if (method === 'GET' && pathname === '/api/findings/by-neo4j-element-id') {
    const neo4jId = String(
      params.neo4j_element_id ?? params.neo4jElementId ?? '',
    ).trim();
    const finding = getDemoFindingByNeo4jId(neo4jId);
    if (!finding) {
      return { success: false, message: '未找到对应漏洞' };
    }
    return { success: true, data: finding };
  }
  if (method === 'GET' && pathname === '/api/findings/stats') {
    return demoFindingsStats;
  }
  if (method === 'GET' && pathname === '/api/findings/stats/by-type') {
    const limit = Math.min(200, Math.max(1, Number(params.limit) || 5));
    return {
      ...demoFindingsStatsByType,
      data: demoFindingsStatsByType.data.slice(0, limit),
    };
  }
  if (method === 'GET' && pathname === '/api/findings/stats/daily') {
    const days = Math.min(365, Math.max(1, Number(params.days) || 30));
    return demoFindingsStatsDaily(days);
  }
  const findingStatusMatch = pathname.match(
    /^\/api\/findings\/([^/]+)\/status$/,
  );
  if (method === 'PATCH' && findingStatusMatch) {
    const detail = getDemoFindingDetail(findingStatusMatch[1]!);
    return detail
      ? { success: true, data: detail }
      : { success: false, message: '漏洞不存在' };
  }
  const findingMatch = pathname.match(/^\/api\/findings\/([^/]+)$/);
  if (method === 'GET' && findingMatch) {
    const findingId = findingMatch[1]!;
    const detail = getDemoFindingDetail(findingId);
    if (!detail) {
      return { success: false, message: '漏洞不存在' };
    }
    return { success: true, data: detail };
  }

  // —— Events / Logs（任务详情页聚合接口）——
  const humanApprovalMatch = pathname.match(
    /^\/api\/events\/human-approvals\/([^/]+)$/,
  );
  if (humanApprovalMatch) {
    const interactionId = humanApprovalMatch[1]!;
    const payload = demoHumanApprovalByInteractionId[interactionId];
    if (method === 'GET') {
      return payload
        ? { success: true, data: payload }
        : { success: false, message: '审批记录不存在' };
    }
    if (method === 'POST') {
      return {
        success: true,
        data: {
          interaction_id: interactionId,
          approved: true,
          operator: 'user',
        },
      };
    }
  }

  const opencodeMatch = pathname.match(/^\/api\/events\/(\d+)\/opencode$/);
  if (method === 'GET' && opencodeMatch) {
    const eventId = Number(opencodeMatch[1]);
    const afterId = Number(params.after_id ?? params.afterId);
    const list = getDemoOpencodeEvents(
      eventId,
      Number.isFinite(afterId) && afterId > 0 ? afterId : undefined,
    );
    return { success: true, data: list, total: list.length };
  }

  const eventByIdMatch = pathname.match(/^\/api\/events\/(\d+)$/);
  if (method === 'GET' && eventByIdMatch) {
    const eventId = Number(eventByIdMatch[1]);
    const row = getDemoEventById(eventId);
    return row
      ? { success: true, data: row }
      : { success: false, message: '事件不存在' };
  }

  if (method === 'GET' && pathname === '/api/events') {
    const taskId = String(params.task_id ?? params.taskId ?? '').trim();
    const afterRaw = params.after_id ?? params.afterId;
    const afterId =
      afterRaw !== undefined && afterRaw !== '' ? Number(afterRaw) : undefined;
    const list = filterDemoTaskEvents(
      taskId,
      Number.isFinite(afterId) ? afterId : undefined,
    );
    return { success: true, data: list, total: list.length };
  }

  if (method === 'GET' && pathname === '/api/logs') {
    const taskId = String(params.task_id ?? params.taskId ?? '').trim();
    const logs =
      taskId && taskId !== DEMO_TASK_ID
        ? []
        : demoTaskLogs.filter(
            (l) => !taskId || l.task_id === taskId || !l.task_id,
          );
    return paginate(logs, params);
  }

  if (method === 'GET' && pathname === '/api/graph') {
    const taskId = String(params.task_id ?? params.taskId ?? '').trim();
    return getDemoTaskGraph(taskId);
  }

  // —— Graph ——
  if (method === 'GET' && pathname === '/api/graph/result-to-language') {
    const taskId = String(params.task_id ?? '');
    const resultNodeId = String(params.result_node_id ?? '');
    return getDemoResultToLanguageGraph(taskId, resultNodeId);
  }

  // —— Tokens / Dashboard ——
  if (method === 'GET' && pathname === '/api/tokens/stats') {
    return demoTokensStats;
  }
  if (method === 'GET' && pathname === '/api/tokens/trend') {
    const days = Math.min(365, Math.max(1, Number(params.days) || 30));
    return demoTokensTrendSlice(days);
  }

  // —— 写操作：Demo 下静默成功 ——
  if (
    method === 'POST' &&
    (pathname.startsWith('/api/tasks/batch/') ||
      pathname === '/api/tasks' ||
      pathname.match(/^\/api\/tasks\/[^/]+\/(run|cancel|pause|resume)$/))
  ) {
    return { success: true, data: { tasks: [demoTask], errors: [] } };
  }
  if (method === 'DELETE' && pathname.startsWith('/api/projects')) {
    return { success: true, data: true };
  }
  if (method === 'DELETE' && pathname.startsWith('/api/findings')) {
    return { success: true };
  }

  return undefined;
}

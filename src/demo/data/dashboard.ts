/**
 * Dashboard 专用 Demo 数据（合成展示用，非真实 API 快照）。
 * 在 claimflow测试2 基础上扩充任务/项目/趋势，使分析页图表更饱满。
 */
import { DEMO_PROJECT_ID, DEMO_PROJECT_NAME, DEMO_TASK_ID } from '../constants';
import { demoProject } from './project';
import { demoTask } from './task';

const DEMO_EXTRA_PROJECT_IDS = {
  payment: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ecommerce: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  internal: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  legacy: 'd4e5f6a7-b8c9-0123-def0-234567890123',
} as const;

/** 仪表盘展示用项目（含 claimflow-demo） */
export const demoDashboardProjects = [
  demoProject,
  {
    id: DEMO_EXTRA_PROJECT_IDS.payment,
    name: 'payment-gateway',
    path: 'C:\\demo\\projects\\payment-gateway',
    repo_path: 'D:\\code\\demo\\payment-gateway',
    branch: 'main',
    source_type: 'path',
    health_status: 'normal',
    language: {
      total: { code: 28400, files: 198 },
      languages: {
        Java: { code: 18200, files: 120, lines: 21000 },
        TypeScript: { code: 8200, files: 58, lines: 9800 },
        YAML: { code: 1200, files: 12, lines: 2400 },
        Markdown: { code: 0, files: 8, lines: 420 },
      },
    },
    vulnerability_count: 24,
    high_risk_count: 9,
    file_count: 198,
    line_count: 28400,
    last_scanned_at: '2026-05-22T10:00:00.000000',
  },
  {
    id: DEMO_EXTRA_PROJECT_IDS.ecommerce,
    name: 'ecommerce-api',
    path: 'C:\\demo\\projects\\ecommerce-api',
    repo_path: 'D:\\code\\demo\\ecommerce-api',
    branch: 'develop',
    source_type: 'path',
    health_status: 'risk',
    language: {
      total: { code: 52100, files: 312 },
      languages: {
        TypeScript: { code: 32000, files: 180, lines: 38000 },
        Python: { code: 12800, files: 86, lines: 15200 },
        JSON: { code: 4500, files: 22, lines: 4500 },
        CSS: { code: 2800, files: 24, lines: 3100 },
      },
    },
    vulnerability_count: 38,
    high_risk_count: 14,
    file_count: 312,
    line_count: 52100,
    last_scanned_at: '2026-05-23T14:30:00.000000',
  },
  {
    id: DEMO_EXTRA_PROJECT_IDS.internal,
    name: 'internal-admin',
    path: 'C:\\demo\\projects\\internal-admin',
    repo_path: null,
    branch: null,
    source_type: 'upload',
    health_status: 'pending_scan',
    language: {
      total: { code: 8900, files: 64 },
      languages: {
        Vue: { code: 4200, files: 38, lines: 5100 },
        JavaScript: { code: 3100, files: 22, lines: 3600 },
        HTML: { code: 1600, files: 4, lines: 1800 },
      },
    },
    vulnerability_count: 6,
    high_risk_count: 1,
    file_count: 64,
    line_count: 8900,
    last_scanned_at: null,
  },
  {
    id: DEMO_EXTRA_PROJECT_IDS.legacy,
    name: 'legacy-monolith',
    path: 'C:\\demo\\projects\\legacy-monolith',
    repo_path: 'D:\\code\\demo\\legacy-monolith',
    branch: 'release/2.x',
    source_type: 'path',
    health_status: 'normal',
    language: {
      total: { code: 128000, files: 890 },
      languages: {
        Java: { code: 98000, files: 620, lines: 115000 },
        XML: { code: 12000, files: 180, lines: 14000 },
        Properties: { code: 8000, files: 45, lines: 9000 },
        SQL: { code: 10000, files: 45, lines: 11000 },
      },
    },
    vulnerability_count: 52,
    high_risk_count: 18,
    file_count: 890,
    line_count: 128000,
    last_scanned_at: '2026-05-20T08:00:00.000000',
  },
];

type DemoTaskRow = typeof demoTask & { vulnCount: number };

function makeTask(
  partial: Omit<DemoTaskRow, 'todo'> & { todo?: unknown[] },
): DemoTaskRow {
  return {
    todo: [],
    error: '',
    finished_at: null,
    ...partial,
  };
}

/** 仪表盘「最近任务」列表（claimflow测试2 为主，其余为合成任务） */
export const demoDashboardTasks: DemoTaskRow[] = [
  makeTask({
    ...demoTask,
    status: 'paused',
    vulnCount: 11,
  }),
  makeTask({
    id: '0aa5f4b4-ed71-423b-af8c-cab40a53e122',
    project_id: DEMO_PROJECT_ID,
    name: 'claimflow测试1',
    status: 'completed',
    llm_input_token: 659119,
    llm_output_token: 20253,
    code_agent_input_token: 43139,
    code_agent_output_token: 9136,
    created_at: '2026-05-21T14:39:43.540466',
    finished_at: '2026-05-21T15:27:05.685127',
    updated_at: '2026-05-21T15:27:05.685127',
    vulnCount: 8,
  }),
  makeTask({
    id: 'demo-task-running-01',
    project_id: DEMO_EXTRA_PROJECT_IDS.ecommerce,
    name: 'ecommerce-全量审计',
    status: 'running',
    llm_input_token: 420000,
    llm_output_token: 28000,
    code_agent_input_token: 95000,
    code_agent_output_token: 12000,
    created_at: '2026-05-24T09:00:00.000000',
    updated_at: '2026-05-24T11:30:00.000000',
    vulnCount: 15,
  }),
  makeTask({
    id: 'demo-task-running-02',
    project_id: DEMO_EXTRA_PROJECT_IDS.payment,
    name: 'payment-接口扫描',
    status: 'running',
    llm_input_token: 185000,
    llm_output_token: 9200,
    code_agent_input_token: 42000,
    code_agent_output_token: 6800,
    created_at: '2026-05-24T10:15:00.000000',
    updated_at: '2026-05-24T11:45:00.000000',
    vulnCount: 6,
  }),
  makeTask({
    id: 'demo-task-completed-01',
    project_id: DEMO_EXTRA_PROJECT_IDS.payment,
    name: 'payment-回归扫描',
    status: 'completed',
    llm_input_token: 312000,
    llm_output_token: 18400,
    code_agent_input_token: 52000,
    code_agent_output_token: 9100,
    created_at: '2026-05-20T08:00:00.000000',
    finished_at: '2026-05-20T16:20:00.000000',
    updated_at: '2026-05-20T16:20:00.000000',
    vulnCount: 24,
  }),
  makeTask({
    id: 'demo-task-completed-02',
    project_id: DEMO_EXTRA_PROJECT_IDS.legacy,
    name: 'legacy-增量审计',
    status: 'completed',
    llm_input_token: 890000,
    llm_output_token: 42000,
    code_agent_input_token: 120000,
    code_agent_output_token: 22000,
    created_at: '2026-05-18T14:00:00.000000',
    finished_at: '2026-05-19T22:10:00.000000',
    updated_at: '2026-05-19T22:10:00.000000',
    vulnCount: 31,
  }),
  makeTask({
    id: 'demo-task-failed-01',
    project_id: DEMO_EXTRA_PROJECT_IDS.ecommerce,
    name: 'ecommerce-hotfix扫描',
    status: 'failed',
    llm_input_token: 95000,
    llm_output_token: 4100,
    code_agent_input_token: 12000,
    code_agent_output_token: 800,
    error: '编排超时：子任务未在限定时间内完成',
    created_at: '2026-05-23T16:00:00.000000',
    finished_at: '2026-05-23T18:05:00.000000',
    updated_at: '2026-05-23T18:05:00.000000',
    vulnCount: 4,
  }),
  makeTask({
    id: 'demo-task-failed-02',
    project_id: DEMO_EXTRA_PROJECT_IDS.legacy,
    name: 'legacy-补丁验证',
    status: 'failed',
    llm_input_token: 210000,
    llm_output_token: 11000,
    code_agent_input_token: 0,
    code_agent_output_token: 0,
    error: '代码索引损坏，无法继续分析',
    created_at: '2026-05-22T11:00:00.000000',
    finished_at: '2026-05-22T11:45:00.000000',
    updated_at: '2026-05-22T11:45:00.000000',
    vulnCount: 0,
  }),
  makeTask({
    id: 'demo-task-pending-01',
    project_id: DEMO_EXTRA_PROJECT_IDS.internal,
    name: 'admin-待扫描',
    status: 'pending',
    llm_input_token: 0,
    llm_output_token: 0,
    code_agent_input_token: 0,
    code_agent_output_token: 0,
    created_at: '2026-05-24T12:00:00.000000',
    updated_at: '2026-05-24T12:00:00.000000',
    vulnCount: 0,
  }),
  makeTask({
    id: 'demo-task-paused-02',
    project_id: DEMO_PROJECT_ID,
    name: 'claimflow-回归测试',
    status: 'paused',
    llm_input_token: 245000,
    llm_output_token: 12000,
    code_agent_input_token: 18000,
    code_agent_output_token: 3200,
    created_at: '2026-05-23T09:30:00.000000',
    updated_at: '2026-05-23T15:00:00.000000',
    vulnCount: 5,
  }),
];

export const demoTasksStats = {
  success: true as const,
  data: {
    total: demoDashboardTasks.length,
    by_status: {
      pending: 1,
      running: 2,
      paused: 2,
      completed: 3,
      failed: 2,
      cancelled: 0,
    },
  },
};

/** 仪表盘漏洞汇总（略高于单任务 11 条，用于 KPI/饼图） */
export const demoFindingsStats = {
  success: true as const,
  data: {
    total: 58,
    by_severity: {
      critical: 6,
      high: 22,
      medium: 14,
      low: 9,
      info: 5,
      unknown: 2,
    },
  },
};

export const demoFindingsStatsByType = {
  success: true as const,
  data: [
    { category_name: 'idor', count: 18 },
    { category_name: 'sql_injection', count: 11 },
    { category_name: 'broken_access_control', count: 8 },
    { category_name: 'xss', count: 7 },
    { category_name: 'authentication_bypass', count: 5 },
    { category_name: 'path_traversal', count: 4 },
    { category_name: 'insecure_deserialization', count: 3 },
    { category_name: 'business_logic_vulnerability', count: 2 },
  ],
};

function buildDailySeveritySeries(): Array<{
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  unknown: number;
}> {
  const rows: Array<{
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    unknown: number;
  }> = [];
  const today = new Date('2026-05-24T12:00:00.000Z');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const wave = Math.sin(i / 4) * 2;
    const growth = Math.max(0, 29 - i);
    rows.push({
      date,
      critical: Math.max(0, Math.round((i % 7 === 2 ? 2 : 0) + wave * 0.3)),
      high: Math.max(0, Math.round(1 + growth * 0.35 + wave)),
      medium: Math.max(0, Math.round(0.5 + growth * 0.25)),
      low: Math.max(0, Math.round((i % 5) * 0.4)),
      info: Math.max(0, Math.round(i % 4 === 0 ? 1 : 0)),
      unknown: i === 28 ? 2 : 0,
    });
  }
  return rows;
}

const DEMO_FINDINGS_DAILY = buildDailySeveritySeries();

export function demoFindingsStatsDaily(days: number) {
  const d = Math.max(1, Math.min(365, days));
  return {
    success: true as const,
    data: DEMO_FINDINGS_DAILY.slice(-d),
  };
}

function aggregateLanguages() {
  const map = new Map<string, { code: number; files: number; lines: number }>();
  for (const p of demoDashboardProjects) {
    const langs = p.language?.languages ?? {};
    for (const [name, v] of Object.entries(langs)) {
      const cur = map.get(name) ?? { code: 0, files: 0, lines: 0 };
      cur.code += v.code ?? 0;
      cur.files += v.files ?? 0;
      cur.lines += v.lines ?? 0;
      map.set(name, cur);
    }
  }
  return [...map.entries()]
    .map(([language, v]) => ({ language, ...v }))
    .sort((a, b) => b.code - a.code);
}

export const demoProjectsOverview = {
  success: true as const,
  data: {
    total_projects: demoDashboardProjects.length,
    total_files: demoDashboardProjects.reduce((s, p) => s + p.file_count, 0),
    total_lines: demoDashboardProjects.reduce((s, p) => s + p.line_count, 0),
    languages: aggregateLanguages(),
    top_by_vulnerabilities: [...demoDashboardProjects]
      .sort((a, b) => b.vulnerability_count - a.vulnerability_count)
      .map((p) => ({
        project_id: p.id,
        project_name: p.name,
        vulnerability_count: p.vulnerability_count,
      })),
  },
};

export const demoProjectsStats = {
  success: true as const,
  data: {
    total: demoDashboardProjects.length,
    pending_scan: demoDashboardProjects.filter(
      (p) => p.health_status === 'pending_scan',
    ).length,
    scanned_today: 2,
    total_vulnerabilities: demoFindingsStats.data.total,
  },
};

function sumTaskTokens(): {
  llm_input: number;
  llm_output: number;
  code_agent_input: number;
  code_agent_output: number;
  total: number;
} {
  let llm_input = 0;
  let llm_output = 0;
  let code_agent_input = 0;
  let code_agent_output = 0;
  for (const t of demoDashboardTasks) {
    llm_input += t.llm_input_token ?? 0;
    llm_output += t.llm_output_token ?? 0;
    code_agent_input += t.code_agent_input_token ?? 0;
    code_agent_output += t.code_agent_output_token ?? 0;
  }
  return {
    llm_input,
    llm_output,
    code_agent_input,
    code_agent_output,
    total: llm_input + llm_output + code_agent_input + code_agent_output,
  };
}

const DEMO_TOKEN_TOTALS = sumTaskTokens();

export const demoTokensStats = {
  success: true as const,
  data: DEMO_TOKEN_TOTALS,
};

function buildTokenTrendSeries(): Array<{
  date: string;
  llm_input: number;
  llm_output: number;
  code_agent_input: number;
  code_agent_output: number;
  total: number;
}> {
  const rows: Array<{
    date: string;
    llm_input: number;
    llm_output: number;
    code_agent_input: number;
    code_agent_output: number;
    total: number;
  }> = [];
  const today = new Date('2026-05-24T12:00:00.000Z');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const factor = 0.4 + (29 - i) * 0.02 + (Math.sin(i / 3) + 1) * 0.15;
    const llm_input = Math.round(180000 * factor);
    const llm_output = Math.round(12000 * factor);
    const code_agent_input = Math.round(45000 * factor);
    const code_agent_output = Math.round(5500 * factor);
    rows.push({
      date,
      llm_input,
      llm_output,
      code_agent_input,
      code_agent_output,
      total: llm_input + llm_output + code_agent_input + code_agent_output,
    });
  }
  return rows;
}

export const demoTokensTrend = {
  success: true as const,
  data: buildTokenTrendSeries(),
};

export function demoTokensTrendSlice(days: number) {
  const d = Math.max(1, Math.min(365, days));
  return {
    success: true as const,
    data: demoTokensTrend.data.slice(-d),
  };
}

/** 任务列表筛选（仪表盘 / 任务页共用 Demo 任务池） */
export function filterDemoDashboardTasks(params: {
  project_id?: string;
  projectId?: string;
  name?: string;
}) {
  const projectId = String(params.project_id ?? params.projectId ?? '');
  const name = String(params.name ?? '').trim();
  return demoDashboardTasks.filter((t) => {
    if (projectId && t.project_id !== projectId) return false;
    if (name && !t.name.includes(name)) return false;
    return true;
  });
}

/** 真实任务详情仍可打开 */
export function getDemoTaskById(taskId: string) {
  if (taskId === DEMO_TASK_ID) return demoTask;
  return demoDashboardTasks.find((t) => t.id === taskId) ?? null;
}

/** 漏洞/任务详情仍仅 claimflow测试2 */
export { DEMO_PROJECT_ID, DEMO_PROJECT_NAME, DEMO_TASK_ID };

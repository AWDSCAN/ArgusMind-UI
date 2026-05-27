import dayjs from 'dayjs';
import type {
  DashboardHeader,
  DashboardKpiCard,
  DashboardRecentTask,
  DashboardSummary,
  DistributionSlice,
  LanguageSlice,
  ScanCoverage,
  TokenTrendPoint,
  TopRiskProject,
  TopVulnType,
  VulnTrendPoint,
} from '@/services/dashboard';
import {
  type DailySeverityStatRaw,
  type DailyTokenStatRaw,
  type FindingStatsRaw,
  type FindingTypeStatRaw,
  type ProjectOverviewStatsRaw,
  FINDING_SEVERITY_ORDER as SEVERITY_ORDER,
  type TaskStatsRaw,
  type TokenStatsRaw,
} from '@/services/dashboardApi';
import type { ProjectListItem } from '@/services/projects';
import { fillDailySeverity, fillDailyToken } from './dashboardSeries';
import {
  formatFindingCategory,
  formatFindingSeverity,
} from './formatDashboard';

const TASK_STATUS_LABEL: Record<string, string> = {
  pending: '待执行',
  running: '运行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

function severityCount(
  by: FindingStatsRaw['by_severity'] | undefined,
  keys: string[],
): number {
  if (!by) return 0;
  return keys.reduce((sum, k) => sum + (by[k as keyof typeof by] ?? 0), 0);
}

function dailyTotal(row: DailySeverityStatRaw): number {
  return (
    (row.info ?? 0) +
    (row.low ?? 0) +
    (row.medium ?? 0) +
    (row.high ?? 0) +
    (row.critical ?? 0) +
    (row.unknown ?? 0)
  );
}

function formatChartDay(date: string): string {
  return dayjs(date).format('MM-DD');
}

function toDistribution(
  items: { key: string; label: string; count: number }[],
): DistributionSlice[] {
  const total = items.reduce((s, i) => s + i.count, 0);
  return items
    .filter((i) => i.count > 0)
    .map((i) => ({
      ...i,
      percent: total > 0 ? Math.round((i.count / total) * 1000) / 10 : 0,
    }));
}

function buildVulnTrend(dailyFilled: DailySeverityStatRaw[]): VulnTrendPoint[] {
  return dailyFilled.map((row) => ({
    day: formatChartDay(row.date),
    total: dailyTotal(row),
    critical: row.critical ?? 0,
    high: row.high ?? 0,
    medium: row.medium ?? 0,
    low: row.low ?? 0,
    info: row.info ?? 0,
    unknown: row.unknown ?? 0,
  }));
}

function buildTokenTrend(dailyFilled: DailyTokenStatRaw[]): TokenTrendPoint[] {
  return dailyFilled.map((row) => ({
    day: formatChartDay(row.date),
    tokens: row.total ?? 0,
  }));
}

function buildLanguageSlices(
  languages: ProjectOverviewStatsRaw['languages'],
): LanguageSlice[] {
  const totalCode = languages.reduce((s, l) => s + (l.code ?? 0), 0);
  if (totalCode <= 0) return [];
  return [...languages]
    .sort((a, b) => b.code - a.code)
    .map((l) => ({
      language: l.language,
      percent: Math.round((l.code / totalCode) * 1000) / 10,
    }));
}

function taskTokenTotal(t: API.TaskRead): number {
  return (
    (t.llm_input_token ?? 0) +
    (t.llm_output_token ?? 0) +
    (t.code_agent_input_token ?? 0) +
    (t.code_agent_output_token ?? 0)
  );
}

function taskDurationSeconds(t: API.TaskRead): number | null {
  const start = dayjs(t.created_at);
  const end = t.finished_at ? dayjs(t.finished_at) : null;
  if (!end?.isValid()) {
    if (t.status === 'running' && start.isValid()) {
      return Math.max(0, dayjs().diff(start, 'second'));
    }
    return null;
  }
  return Math.max(0, end.diff(start, 'second'));
}

export type BuildDashboardInput = {
  taskStats: TaskStatsRaw;
  projectOverview: ProjectOverviewStatsRaw;
  findingStats: FindingStatsRaw;
  findingByType: FindingTypeStatRaw[];
  findingDaily: DailySeverityStatRaw[];
  tokenStats: TokenStatsRaw;
  tokenTrend: DailyTokenStatRaw[];
  projectListStats: {
    total: number;
    pendingScan: number;
  } | null;
  recentTasks: API.TaskRead[];
  projectMap: Map<string, ProjectListItem>;
  trendDays: number;
};

function countPendingScanProjects(
  projectMap: Map<string, ProjectListItem>,
): number {
  let n = 0;
  for (const p of projectMap.values()) {
    if (p.healthStatus === 'pending_scan') n += 1;
  }
  return n;
}

export function buildDashboardView(
  input: BuildDashboardInput,
): DashboardSummary {
  const {
    taskStats,
    projectOverview,
    findingStats,
    findingByType,
    findingDaily,
    tokenStats,
    tokenTrend,
    projectListStats,
    recentTasks,
    projectMap,
    trendDays,
  } = input;

  const byStatus = taskStats.by_status ?? {};
  const running = byStatus.running ?? 0;
  const pending = byStatus.pending ?? 0;
  const completed = byStatus.completed ?? 0;
  const failed = byStatus.failed ?? 0;
  const finished = completed + failed;
  const successRate =
    finished > 0 ? Math.round((completed / finished) * 1000) / 10 : null;

  const dailyFilled = fillDailySeverity(findingDaily, trendDays);
  const tokenFilled = fillDailyToken(tokenTrend, trendDays);

  const highVuln = severityCount(findingStats.by_severity, [
    'high',
    'critical',
  ]);
  const projectTotal =
    projectListStats?.total ?? projectOverview.total_projects ?? 0;

  const header: DashboardHeader = {
    systemStatus:
      (successRate != null ? successRate >= 60 : failed === 0) ||
      taskStats.total === 0
        ? 'normal'
        : 'degraded',
    onlineScanNodes: running,
    scanQueueSize: pending,
    systemHealthPercent: successRate ?? 0,
  };

  const kpiCards: DashboardKpiCard[] = [
    { key: 'tasksTotal', title: '任务总数', value: taskStats.total },
    { key: 'tasksRunning', title: '运行中任务', value: running },
    { key: 'projectCount', title: '项目数', value: projectTotal },
    {
      key: 'vulnTotal',
      title: '总漏洞数',
      value: findingStats.total ?? 0,
    },
    {
      key: 'vulnHigh',
      title: '严重/高危漏洞',
      value: highVuln,
    },
    {
      key: 'tokenUsed',
      title: 'Token 消耗',
      value: tokenStats.total,
      valueType: 'token',
      tokenBreakdown: {
        llmInput: tokenStats.llm_input ?? 0,
        llmOutput: tokenStats.llm_output ?? 0,
        codeAgentInput: tokenStats.code_agent_input ?? 0,
        codeAgentOutput: tokenStats.code_agent_output ?? 0,
      },
    },
  ];

  const taskStatusDistribution = toDistribution(
    (['running', 'completed', 'failed', 'pending'] as const).map((key) => ({
      key,
      label: TASK_STATUS_LABEL[key] ?? key,
      count: byStatus[key] ?? 0,
    })),
  );

  const bySeverity = findingStats.by_severity ?? {};
  const riskItems = SEVERITY_ORDER.map((key) => ({
    key,
    label: formatFindingSeverity(key),
    count: Number(bySeverity[key]) || 0,
  }));
  const riskDistribution = toDistribution(riskItems);

  const findingTypeList = Array.isArray(findingByType) ? findingByType : [];
  const topVulnTypes: TopVulnType[] = findingTypeList
    .map((row) => ({
      type: formatFindingCategory(row.category_name),
      count: Number(row.count) || 0,
    }))
    .filter((row) => row.count > 0);

  const languageDistribution = buildLanguageSlices(
    projectOverview.languages ?? [],
  );

  const topRiskProjects: TopRiskProject[] = (
    projectOverview.top_by_vulnerabilities ?? []
  ).map((p) => {
    const project = projectMap.get(p.project_id);
    return {
      projectId: p.project_id,
      projectName: p.project_name,
      vulnCount: p.vulnerability_count,
      highRiskCount: project?.highRiskCount ?? 0,
    };
  });

  const totalProjects =
    projectListStats?.total ?? projectOverview.total_projects ?? 0;
  const unscanned =
    projectListStats?.pendingScan ?? countPendingScanProjects(projectMap);
  const scanned = Math.max(0, totalProjects - unscanned);
  const scanCoverage: ScanCoverage = {
    percent:
      totalProjects > 0 ? Math.round((scanned / totalProjects) * 100) : 0,
    scannedRepos: scanned,
    totalRepos: totalProjects,
    unscannedRepos: unscanned,
    pendingTasks: pending,
    excludedRepos: 0,
  };

  const taskList = Array.isArray(recentTasks) ? recentTasks : [];
  const recent: DashboardRecentTask[] = [...taskList]
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, 10)
    .map((t) => {
      const project = projectMap.get(t.project_id);
      return {
        id: t.id,
        name: t.name,
        projectName: project?.name ?? '未知项目',
        status: t.status,
        vulnCount: t.vulnCount ?? 0,
        highRiskCount: 0,
        fileCount: project?.fileCount ?? 0,
        lineCount: project?.lineCount ?? 0,
        tokenUsed: taskTokenTotal(t),
        durationSeconds: taskDurationSeconds(t),
        createdAt: t.created_at,
      };
    });

  return {
    header,
    kpiCards,
    vulnTrend: buildVulnTrend(dailyFilled),
    tokenTrend: buildTokenTrend(tokenFilled),
    taskStatusDistribution,
    riskDistribution,
    topVulnTypes,
    languageDistribution,
    topRiskProjects,
    scanCoverage,
    recentTasks: recent,
  };
}

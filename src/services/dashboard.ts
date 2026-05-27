/** Dashboard 视图模型（由多接口聚合构建，见 useDashboardData） */

export type DashboardSystemStatus = 'normal' | 'degraded' | 'down';

export type DashboardHeader = {
  systemStatus: DashboardSystemStatus;
  /** 运行中任务数 */
  onlineScanNodes: number;
  /** 待执行 + 运行中 */
  scanQueueSize: number;
  /** 任务成功率 0–100 */
  systemHealthPercent: number;
};

export type DashboardKpiTokenBreakdown = {
  llmInput: number;
  llmOutput: number;
  codeAgentInput: number;
  codeAgentOutput: number;
};

export type DashboardKpiCard = {
  key: string;
  title: string;
  value: number;
  valueType?: 'number' | 'percent' | 'token' | 'lines';
  /** Token 卡片悬停明细 */
  tokenBreakdown?: DashboardKpiTokenBreakdown;
};

export type VulnTrendPoint = {
  day: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  unknown?: number;
};

export type TokenTrendPoint = {
  day: string;
  tokens: number;
};

export type DistributionSlice = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

export type TopVulnType = {
  type: string;
  count: number;
};

export type LanguageSlice = {
  language: string;
  percent: number;
};

export type TopRiskProject = {
  projectId: string;
  projectName: string;
  vulnCount: number;
  /** 概览接口未提供时恒为 0 */
  highRiskCount: number;
};

export type ScanCoverage = {
  percent: number;
  scannedRepos: number;
  totalRepos: number;
  unscannedRepos: number;
  pendingTasks: number;
  excludedRepos: number;
};

export type DashboardRecentTask = {
  id: string;
  name: string;
  projectName: string;
  status: string;
  vulnCount: number;
  highRiskCount: number;
  fileCount: number;
  lineCount: number;
  tokenUsed: number;
  durationSeconds?: number | null;
  createdAt: string;
};

export type DashboardSummary = {
  header: DashboardHeader;
  kpiCards: DashboardKpiCard[];
  vulnTrend: VulnTrendPoint[];
  tokenTrend: TokenTrendPoint[];
  taskStatusDistribution: DistributionSlice[];
  riskDistribution: DistributionSlice[];
  topVulnTypes: TopVulnType[];
  languageDistribution: LanguageSlice[];
  topRiskProjects: TopRiskProject[];
  scanCoverage: ScanCoverage;
  recentTasks: DashboardRecentTask[];
};

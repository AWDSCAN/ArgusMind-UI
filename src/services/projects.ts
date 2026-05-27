import { request } from '@umijs/max';

export type ProjectSourceType = 'git' | 'upload' | 'path';

export type ProjectHealthStatus = 'normal' | 'risk' | 'pending_scan';

export type ProjectLanguageStat = {
  files: number;
  lines: number;
  code: number;
};

/** tokei 写入的 language_stats 结构 */
export type ProjectLanguageStats = {
  languages: Record<string, ProjectLanguageStat>;
  total: {
    files: number;
    code: number;
    lines?: number;
  };
};

/** 列表接口 `GET /api/projects` 单项 */
export type ProjectListItem = {
  id: string;
  name: string;
  /** 项目在服务器上的工作目录 */
  path: string;
  /** 仓库/来源路径（展示用，可与 path 不同） */
  repoPath: string;
  branch: string | null;
  sourceType: ProjectSourceType | null;
  healthStatus: ProjectHealthStatus;
  language: ProjectLanguageStats | null;
  vulnerabilityCount: number;
  highRiskCount: number;
  fileCount: number;
  lineCount: number;
  lastScannedAt: string | null;
};

export type ProjectListStats = {
  total: number;
  normal: number;
  risk: number;
  pendingScan: number;
  scannedToday: number;
  totalVulnerabilities: number;
};

export type ProjectItem = {
  id: string;
  name: string;
  key: string;
  projectUuid?: string;
  path?: string;
  description?: string;
  descriptionCompact?: string;
  sourceType: ProjectSourceType;
  repoUrl?: string;
  branch?: string;
  archiveFileName?: string;
  serverPath?: string;
  storagePath?: string;
  fileCount?: number;
  lineCount?: number;
  languageStats?: Record<string, number>;
  language?: string;
  scale?: string;
  importStatus: 'pending' | 'importing' | 'success' | 'failed';
  importMessage?: string;
  lastScannedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  success: boolean;
};

export type ProjectOption = {
  id: string;
  name: string;
};

/** 下拉选项 `GET /api/projects/options`（全量，不分页） */
export async function getProjectOptions() {
  const res = await request<{ success: boolean; data: ProjectOption[] }>(
    '/api/projects/options',
    { method: 'GET' },
  );
  return res.data ?? [];
}

export type ListProjectsParams = {
  current?: number;
  pageSize?: number;
  name?: string;
  keyword?: string;
  sourceType?: ProjectSourceType;
  healthStatus?: ProjectHealthStatus;
};

export type CreateProjectBody = {
  name: string;
  sourceType: 'git' | 'upload' | 'path';
  gitUrl?: string;
  gitBranch?: string;
  archiveFile?: File;
  sourcePath?: string;
};

function parseHealthStatus(raw: unknown): ProjectHealthStatus {
  const v = String(raw ?? 'normal');
  if (v === 'risk' || v === 'pending_scan' || v === 'pending') {
    return v === 'pending' ? 'pending_scan' : (v as ProjectHealthStatus);
  }
  return 'normal';
}

function parseSourceType(raw: unknown): ProjectSourceType | null {
  if (raw === 'git' || raw === 'upload' || raw === 'path') return raw;
  if (raw === 'archive') return 'upload';
  return null;
}

function mapListItem(item: Record<string, unknown>): ProjectListItem {
  const path = String(item.path ?? '');
  const repoPath = String(
    item.repo_path ?? item.repoPath ?? item.source_path ?? item.source_git_url ?? path,
  );
  const lastScannedAt =
    (item.last_scanned_at as string) ?? (item.lastScannedAt as string) ?? null;

  let healthStatus = parseHealthStatus(item.health_status ?? item.healthStatus);
  if (!item.health_status && !item.healthStatus) {
    if (!lastScannedAt) healthStatus = 'pending_scan';
  }

  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    path,
    repoPath,
    branch: item.branch == null ? null : String(item.branch),
    sourceType: parseSourceType(item.source_type ?? item.sourceType),
    healthStatus,
    language: (item.language as ProjectLanguageStats | null) ?? null,
    vulnerabilityCount: Number(item.vulnerability_count ?? item.vulnerabilityCount ?? 0),
    highRiskCount: Number(
      item.high_risk_count ?? item.highRiskCount ?? item.critical_count ?? 0,
    ),
    fileCount: Number(item.file_count ?? item.fileCount ?? 0),
    lineCount: Number(item.line_count ?? item.lineCount ?? 0),
    lastScannedAt,
  };
}

export async function listProjects(params: ListProjectsParams = {}) {
  const res = await request<PageResult<Record<string, unknown>>>('/api/projects', {
    method: 'GET',
    params: {
      current: params.current ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.name ? { name: params.name } : {}),
      ...(params.keyword && !params.name ? { keyword: params.keyword } : {}),
      ...(params.sourceType ? { source_type: params.sourceType } : {}),
      ...(params.healthStatus ? { health_status: params.healthStatus } : {}),
    },
  });
  return {
    ...res,
    data: (res.data || []).map(mapListItem),
  } as PageResult<ProjectListItem>;
}

/** 项目列表页顶部统计（建议后端提供独立接口） */
export async function getProjectListStats(params?: {
  name?: string;
  sourceType?: ProjectSourceType;
}) {
  try {
    const res = await request<{ success: boolean; data: Record<string, unknown> }>(
      '/api/projects/stats',
      {
        method: 'GET',
        params: {
          ...(params?.name ? { name: params.name } : {}),
          ...(params?.sourceType ? { source_type: params.sourceType } : {}),
        },
      },
    );
    const d = res.data ?? {};
    return {
      total: Number(d.total ?? 0),
      normal: Number(d.normal ?? 0),
      risk: Number(d.risk ?? 0),
      pendingScan: Number(d.pending_scan ?? d.pendingScan ?? 0),
      scannedToday: Number(d.scanned_today ?? d.scannedToday ?? 0),
      totalVulnerabilities: Number(d.total_vulnerabilities ?? d.totalVulnerabilities ?? 0),
    } satisfies ProjectListStats;
  } catch {
    return null;
  }
}

export async function getProjectDetail(id: string) {
  return request<{ data: ProjectItem; success: boolean }>('/api/projects/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function createProject(body: CreateProjectBody) {
  const formData = new FormData();
  formData.append('name', body.name);
  formData.append('source_type', body.sourceType);

  if (body.sourceType === 'git') {
    if (body.gitUrl) formData.append('git_url', body.gitUrl);
    if (body.gitBranch) formData.append('git_branch', body.gitBranch);
  }
  if (body.sourceType === 'upload' && body.archiveFile) {
    formData.append('archive_file', body.archiveFile);
  }
  if (body.sourceType === 'path' && body.sourcePath) {
    formData.append('source_path', body.sourcePath);
  }

  return request<{ success: boolean; data?: ProjectItem }>('/api/projects', {
    method: 'POST',
    data: formData,
  });
}

export async function deleteProject(id: string) {
  return request<{ success: boolean }>(`/api/projects?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

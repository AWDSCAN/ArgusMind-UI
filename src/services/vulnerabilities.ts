import { request } from '@umijs/max';
import { getProjectOptions } from '@/services/projects';
import { getTaskOptions } from '@/services/tasks';
import {
  getFindingApiFindingsFindingIdGet,
  listFindingsApiFindingsGet,
  updateFindingStatusApiFindingsFindingIdStatusPatch,
} from '@/services/swagger/findings';

export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type VulnStatus =
  | 'open'
  | 'confirmed'
  | 'false_positive'
  | 'fixed'
  | 'ignored';

/** 与后端 `exploitation_chain` JSON（version=1）对齐的宽松类型 */
export type ExploitationChainSourceLine = { line_no: number; text: string };
export type ExploitationChainSourceContext = {
  lines?: ExploitationChainSourceLine[];
  focus_line?: number;
  start_line?: number;
  end_line?: number;
  relative_file?: string;
  absolute_path?: string;
};
export type ExploitationChainStep = {
  index: number;
  node_kind: string;
  labels?: string[];
  element_id?: string | null;
  ids?: Record<string, string>;
  properties?: Record<string, unknown>;
  location?: { file: string; line?: number } | null;
  source_context?: ExploitationChainSourceContext | null;
  audit_infos?: unknown[];
};
export type ExploitationChainPath = {
  path_id?: string;
  steps: ExploitationChainStep[];
};
export type ExploitationChainDocument = {
  version?: number;
  analysis_result_node_id?: string;
  task_id?: string;
  project_root?: string;
  generated_at?: string;
  paths?: ExploitationChainPath[];
  error?: string | null;
};

export type VulnVerificationStatus = 'CONFIRMED' | 'REJECTED' | '';

export type VulnerabilityListItem = {
  id: string;
  title: string;
  severity: VulnSeverity;
  status: VulnStatus;
  verdict: string;
  confidence: string;
  verificationStatus: VulnVerificationStatus;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  cwe?: string;
  filePath?: string;
  line?: number;
  description: string;
  discoveredAt: string;
};

export type VulnerabilityDetail = VulnerabilityListItem & {
  categoryName: string;
  neo4jElementId: string;
  exploitationChain: ExploitationChainDocument | null;
  vulnerabilityAnalysisReport: string;
  poc: string;
  evidence: string;
  detailText: string;
  verificationReason: string;
  entryPoints: string;
  securityBoundaries: string;
  analysisRounds: number;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  success: boolean;
};

function normalizeStatus(raw: string | undefined | null): VulnStatus {
  const s = (raw || 'open').toLowerCase().trim();
  if (
    s === 'open' ||
    s === 'confirmed' ||
    s === 'false_positive' ||
    s === 'fixed' ||
    s === 'ignored'
  ) {
    return s;
  }
  return 'open';
}

function normalizeVerificationStatus(
  raw: string | undefined | null,
): VulnVerificationStatus {
  const s = (raw || '').trim().toUpperCase();
  if (s === 'CONFIRMED' || s === 'REJECTED') return s;
  return '';
}

function normalizeSeverity(raw: string | undefined | null): VulnSeverity {
  const x = (raw || '').toLowerCase().trim();
  const map: Record<string, VulnSeverity> = {
    critical: 'critical',
    crit: 'critical',
    severe: 'critical',
    high: 'high',
    medium: 'medium',
    med: 'medium',
    moderate: 'medium',
    low: 'low',
    info: 'info',
    informational: 'info',
    none: 'info',
  };
  if (map[x]) return map[x];
  if (x.includes('critical') || x.includes('严重')) return 'critical';
  if (x.includes('high') || x.includes('高')) return 'high';
  if (x.includes('medium') || x.includes('中')) return 'medium';
  if (x.includes('low') || x.includes('低')) return 'low';
  if (x.includes('info') || x.includes('信息')) return 'info';
  return 'medium';
}

function asExploitationChain(
  raw: unknown,
): ExploitationChainDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as ExploitationChainDocument;
  if (!Array.isArray(o.paths)) return null;
  return o;
}

function lastSinkLocation(
  chain: ExploitationChainDocument | null,
): { file?: string; line?: number } {
  if (!chain?.paths?.length) return {};
  const steps = chain.paths[0].steps ?? [];
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const st = steps[i];
    if (st.node_kind === 'sink_flow_node' && st.location?.file) {
      return {
        file: st.location.file,
        line:
          typeof st.location.line === 'number'
            ? st.location.line
            : undefined,
      };
    }
  }
  return {};
}

function mapFindingToListItem(
  f: API.FindingRead,
  projectName: string,
  taskName: string,
): VulnerabilityListItem {
  const desc =
    [f.verdict, f.category_name, f.confidence].filter(Boolean).join(' · ') ||
    f.vul_name;

  return {
    id: f.id,
    title: f.vul_name,
    severity: normalizeSeverity(f.level),
    status: normalizeStatus(f.status),
    verdict: f.verdict || '',
    confidence: f.confidence || 'LOW',
    verificationStatus: normalizeVerificationStatus(f.verification_status),
    projectId: f.project_id,
    projectName,
    taskId: f.task_id || '',
    taskName,
    cwe: f.category_name || undefined,
    description: desc,
    discoveredAt: f.created_at,
  };
}

function mapFindingToListItemWithDetail(
  f: API.FindingRead,
  projectName: string,
  taskName: string,
): VulnerabilityListItem {
  const base = mapFindingToListItem(f, projectName, taskName);
  const chain = asExploitationChain(f.detail?.exploitation_chain);
  const loc = lastSinkLocation(chain);
  const desc =
    (f.detail?.detail && String(f.detail.detail).trim()) || base.description;

  return {
    ...base,
    filePath: loc.file,
    line: loc.line,
    description: desc,
  };
}

function mapFindingToDetail(
  f: API.FindingRead,
  projectName: string,
  taskName: string,
): VulnerabilityDetail {
  const base = mapFindingToListItemWithDetail(f, projectName, taskName);
  const d = f.detail;
  return {
    ...base,
    verificationStatus:
      normalizeVerificationStatus(f.verification_status) ||
      normalizeVerificationStatus(d?.verification_status),
    categoryName: f.category_name || '',
    neo4jElementId: f.neo4j_element_id || '',
    exploitationChain: asExploitationChain(d?.exploitation_chain),
    vulnerabilityAnalysisReport: d?.vulnerability_analysis_report || '',
    poc: d?.poc || '',
    evidence: d?.evidence || '',
    detailText: d?.detail || '',
    verificationReason: d?.verification_reason || '',
    entryPoints: d?.entry_points || '',
    securityBoundaries: d?.security_boundaries || '',
    analysisRounds: d?.analysis_rounds ?? 0,
  };
}

export async function listVulnerabilities(params: {
  current?: number;
  pageSize?: number;
  keyword?: string;
  severity?: VulnSeverity;
  status?: VulnStatus;
  projectId?: string;
  taskId?: string;
}) {
  const res = await listFindingsApiFindingsGet({
    current: params.current,
    pageSize: params.pageSize,
    project_id: params.projectId || undefined,
    task_id: params.taskId || undefined,
    keyword: params.keyword || undefined,
    severity: params.severity || undefined,
    status: params.status || undefined,
  });

  const [projects, tasks] = await Promise.all([
    getProjectOptions(),
    getTaskOptions(),
  ]);
  const projectMap = new Map(projects.map((p) => [p.id, p.name] as const));
  const taskMap = new Map(tasks.map((t) => [t.id, t.name] as const));

  const data = (res.data ?? []).map((f) =>
    mapFindingToListItem(
      f,
      projectMap.get(f.project_id) || f.project_id,
      (f.task_id && taskMap.get(f.task_id)) || '—',
    ),
  );

  return {
    data,
    total: res.total ?? data.length,
    success: res.success !== false,
  } satisfies PageResult<VulnerabilityListItem>;
}

export async function deleteVulnerability(findingId: string) {
  return request<{ success: boolean }>(
    `/api/findings/${encodeURIComponent(findingId)}`,
    { method: 'DELETE' },
  );
}

export async function updateVulnerabilityStatus(
  findingId: string,
  status: VulnStatus,
) {
  const res = await updateFindingStatusApiFindingsFindingIdStatusPatch(
    { finding_id: findingId },
    { status },
  );
  return {
    success: res.success !== false,
    data: res.data ? normalizeStatus(res.data.status) : status,
  };
}

async function resolveFindingDetail(
  f: API.FindingRead,
): Promise<VulnerabilityDetail> {
  const [projects, tasks] = await Promise.all([
    getProjectOptions(),
    getTaskOptions(),
  ]);
  const projectMap = new Map(projects.map((p) => [p.id, p.name] as const));
  const taskMap = new Map(tasks.map((t) => [t.id, t.name] as const));
  return mapFindingToDetail(
    f,
    projectMap.get(f.project_id) || f.project_id,
    (f.task_id && taskMap.get(f.task_id)) || '—',
  );
}

export async function getVulnerabilityDetail(id: string) {
  const res = await getFindingApiFindingsFindingIdGet({ finding_id: id });
  const f = res.data;
  if (!f) {
    return { success: false as const, data: null as VulnerabilityDetail | null };
  }
  const detail = await resolveFindingDetail(f);
  return { success: true as const, data: detail };
}

/** 按 Neo4j elementId（AnalysisResult 节点 id）查询漏洞 */
export async function getVulnerabilityByNeo4jElementId(neo4jElementId: string) {
  const elementId = neo4jElementId.trim();
  if (!elementId) {
    return { success: false as const, data: null as VulnerabilityDetail | null };
  }
  const res = await request<API.OkResponseFindingRead_>(
    '/api/findings/by-neo4j-element-id',
    {
      method: 'GET',
      params: { neo4j_element_id: elementId },
    },
  );
  const f = res.data;
  if (!f) {
    return { success: false as const, data: null as VulnerabilityDetail | null };
  }
  const detail = await resolveFindingDetail(f);
  return { success: true as const, data: detail };
}

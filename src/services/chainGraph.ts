import { request } from '@umijs/max';
import { normalizeAuditChainGraph } from '@/services/auditSessions';
import type { AuditChainRawGraph } from '@/types/auditSessionDetail';

/** `GET /api/graph/result-to-language` 响应（与全图 nodes/edges 一致，另含有序 path） */
export type ResultToLanguageGraphPayload = {
  nodes?: Array<{
    elementId?: string;
    id?: string;
    labels?: string[];
    props?: Record<string, unknown>;
  }>;
  edges?: Array<{
    elementId?: string;
    id?: string;
    type?: string;
    start?: string;
    end?: string;
    source?: string;
    target?: string;
    props?: Record<string, unknown>;
  }>;
  path?: string[];
};

export type FindingAuditChainGraph = {
  graph: AuditChainRawGraph;
  /** AR → … → Language 的有序 elementId 列表 */
  path: string[];
};

/**
 * 漏洞详情思维链：`GET /api/graph/result-to-language`
 * @param resultNodeId AnalysisResult 的 Neo4j elementId（即 finding.neo4j_element_id）
 */
export async function fetchResultToLanguageGraph(
  taskId: string,
  resultNodeId: string,
): Promise<FindingAuditChainGraph | null> {
  const tid = taskId.trim();
  const rid = resultNodeId.trim();
  if (!tid || !rid) {
    return null;
  }

  try {
    const res = await request<{
      success?: boolean;
      data?: ResultToLanguageGraphPayload;
    }>('/api/graph/result-to-language', {
      method: 'GET',
      params: { task_id: tid, result_node_id: rid },
    });

    const payload = res?.data;
    const graph = normalizeAuditChainGraph(payload);
    if (!graph) {
      return null;
    }

    const path = Array.isArray(payload?.path)
      ? payload.path.map((id) => String(id)).filter(Boolean)
      : [];

    return { graph, path };
  } catch {
    return null;
  }
}

export function auditChainGraphFingerprint(
  result: FindingAuditChainGraph | AuditChainRawGraph | null,
): string {
  if (!result) return '';
  const graph = 'graph' in result ? result.graph : result;
  const path = 'path' in result ? result.path : [];
  const n = graph.nodes.map((x) => x.elementId).sort().join(',');
  const e = graph.edges.map((x) => `${x.start}->${x.end}`).sort().join(',');
  const p = path.join('>');
  return `${n}|${e}|${p}`;
}

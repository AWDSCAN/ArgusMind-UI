import {
  type FindingAuditChainGraph,
  fetchResultToLanguageGraph,
} from '@/services/chainGraph';
import type { VulnerabilityDetail } from '@/services/vulnerabilities';

/** `GET /api/graph/result-to-language` — 当前漏洞 AR → Language 子图 */
export async function resolveFindingAuditChainGraph(
  detail: Pick<VulnerabilityDetail, 'neo4jElementId' | 'taskId'>,
): Promise<FindingAuditChainGraph | null> {
  const resultNodeId = detail.neo4jElementId?.trim();
  const taskId = detail.taskId?.trim();
  if (!resultNodeId || !taskId) {
    return null;
  }
  return fetchResultToLanguageGraph(taskId, resultNodeId);
}

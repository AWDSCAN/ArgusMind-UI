import { DEMO_TASK_ID } from '../constants';
import resultToLanguageGraphsSnapshot from './raw/resultToLanguageGraphs.snapshot.json';

export type ResultToLanguageGraphData = {
  nodes: Array<{
    elementId: string;
    labels: string[];
    props: Record<string, unknown>;
  }>;
  edges: Array<{
    elementId: string;
    type: string;
    start: string;
    end: string;
    props: Record<string, unknown>;
  }>;
  path: string[];
  paths?: string[][];
};

/** neo4j_element_id → GET /api/graph/result-to-language 真实响应 data */
const graphByNeo4jId = resultToLanguageGraphsSnapshot as Record<
  string,
  ResultToLanguageGraphData
>;

const emptyGraph = {
  nodes: [] as ResultToLanguageGraphData['nodes'],
  edges: [] as ResultToLanguageGraphData['edges'],
  path: [] as string[],
};

/**
 * 漏洞详情审计链路：`GET /api/graph/result-to-language`
 * 11 条漏洞均已从后端拉取；按 finding.neo4j_element_id 查找。
 */
export function getDemoResultToLanguageGraph(
  taskId: string,
  resultNodeId: string,
) {
  const rid = resultNodeId.trim();
  if (taskId !== DEMO_TASK_ID || !rid) {
    return { success: true as const, data: emptyGraph };
  }
  const data = graphByNeo4jId[rid];
  if (!data?.nodes?.length) {
    return { success: true as const, data: emptyGraph };
  }
  return { success: true as const, data };
}

/** @deprecated 仅保留类型导出兼容；请使用 getDemoResultToLanguageGraph */
export function buildGraphFromExploitationChain() {
  return { success: true as const, data: emptyGraph };
}

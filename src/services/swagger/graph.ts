// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Result To Language 从 AnalysisResult 沿 FLOW 回溯至 Language 的子图 GET /api/graph/result-to-language */
export async function resultToLanguageApiGraphResultToLanguageGet(
  params: API.resultToLanguageApiGraphResultToLanguageGetParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/graph/result-to-language", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Get Graph 返回图可视化所需的 nodes / edges。

策略：
  - 若带 task_id，优先以该 task 下的 Project 节点为根
  - 否则若带 project_id/name，按名称查找 Project 节点
  - 从根节点 BFS 最多 depth 层，截取 limit 条关系 GET /api/graph */
export async function getGraphApiGraphGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getGraphApiGraphGetParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/graph", {
    method: "GET",
    params: {
      // depth has a default value: 2
      depth: "2",
      // limit has a default value: 500
      limit: "500",
      ...params,
    },
    ...(options || {}),
  });
}

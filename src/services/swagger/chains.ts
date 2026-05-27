// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Chains 按漏洞 ID 返回所关联的调用链路径。 GET /api/chains */
export async function listChainsApiChainsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listChainsApiChainsGetParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseList_>("/api/chains", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Chains By Task 按任务返回该任务生成的所有链路概要。 GET /api/chains/by-task/${param0} */
export async function chainsByTaskApiChainsByTaskTaskIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.chainsByTaskApiChainsByTaskTaskIdGetParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseList_>(`/api/chains/by-task/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Findings GET /api/findings */
export async function listFindingsApiFindingsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listFindingsApiFindingsGetParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResultFindingRead_>("/api/findings", {
    method: "GET",
    params: {
      // current has a default value: 1
      current: "1",
      // pageSize has a default value: 20
      pageSize: "20",
      ...params,
    },
    ...(options || {}),
  });
}

/** Get Finding GET /api/findings/${param0} */
export async function getFindingApiFindingsFindingIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFindingApiFindingsFindingIdGetParams,
  options?: { [key: string]: any }
) {
  const { finding_id: param0, ...queryParams } = params;
  return request<API.OkResponseFindingRead_>(`/api/findings/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Finding PUT /api/findings/${param0} */
export async function updateFindingApiFindingsFindingIdPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateFindingApiFindingsFindingIdPutParams,
  body: API.FindingUpdate,
  options?: { [key: string]: any }
) {
  const { finding_id: param0, ...queryParams } = params;
  return request<API.OkResponseFindingRead_>(`/api/findings/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Update Finding Status PATCH /api/findings/${param0}/status */
export async function updateFindingStatusApiFindingsFindingIdStatusPatch(
  params: API.updateFindingStatusApiFindingsFindingIdStatusPatchParams,
  body: API.FindingStatusUpdate,
  options?: { [key: string]: any }
) {
  const { finding_id: param0, ...queryParams } = params;
  return request<API.OkResponseFindingRead_>(`/api/findings/${param0}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

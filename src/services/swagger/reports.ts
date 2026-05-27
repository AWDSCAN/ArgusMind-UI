// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Get Report GET /api/reports/${param0} */
export async function getReportApiReportsTaskIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getReportApiReportsTaskIdGetParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseDict_>(`/api/reports/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

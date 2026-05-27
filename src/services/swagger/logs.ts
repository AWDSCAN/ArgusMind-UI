// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Logs GET /api/logs */
export async function listLogsApiLogsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listLogsApiLogsGetParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResultLogRead_>("/api/logs", {
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

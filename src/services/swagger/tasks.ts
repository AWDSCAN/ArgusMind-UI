// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Tasks GET /api/tasks */
export async function listTasksApiTasksGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listTasksApiTasksGetParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResultTaskRead_>("/api/tasks", {
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

/** Create Task POST /api/tasks */
export async function createTaskApiTasksPost(
  body: API.AuditTaskCreate,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseTaskRead_>("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Task GET /api/tasks/${param0} */
export async function getTaskApiTasksTaskIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskApiTasksTaskIdGetParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Task PUT /api/tasks/${param0} */
export async function updateTaskApiTasksTaskIdPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateTaskApiTasksTaskIdPutParams,
  body: API.TaskUpdate,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Delete Task DELETE /api/tasks/${param0} */
export async function deleteTaskApiTasksTaskIdDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteTaskApiTasksTaskIdDeleteParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseBool_>(`/api/tasks/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Cancel Task POST /api/tasks/${param0}/cancel */
export async function cancelTaskApiTasksTaskIdCancelPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelTaskApiTasksTaskIdCancelPostParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}/cancel`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Run Task Endpoint POST /api/tasks/${param0}/run */
export async function runTaskEndpointApiTasksTaskIdRunPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.runTaskEndpointApiTasksTaskIdRunPostParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}/run`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Pause Task GET /api/tasks/${param0}/pause */
export async function pauseTaskApiTasksTaskIdPauseGet(
  params: API.getTaskApiTasksTaskIdGetParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}/pause`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Resume Task GET /api/tasks/${param0}/resume */
export async function resumeTaskApiTasksTaskIdResumeGet(
  params: API.getTaskApiTasksTaskIdGetParams,
  options?: { [key: string]: any }
) {
  const { task_id: param0, ...queryParams } = params;
  return request<API.OkResponseTaskRead_>(`/api/tasks/${param0}/resume`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Projects GET /api/projects */
export async function listProjectsApiProjectsGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listProjectsApiProjectsGetParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResultProjectRead_>("/api/projects", {
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

/** Create Project POST /api/projects */
export async function createProjectApiProjectsPost(
  body: API.BodyCreateProjectApiProjectsPost,
  options?: { [key: string]: any }
) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(
            ele,
            new Blob([JSON.stringify(item)], { type: "application/json" })
          );
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.OkResponseProjectRead_>("/api/projects", {
    method: "POST",
    data: formData,
    requestType: "form",
    ...(options || {}),
  });
}

/** Delete Project By Query DELETE /api/projects */
export async function deleteProjectByQueryApiProjectsDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteProjectByQueryApiProjectsDeleteParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseBool_>("/api/projects", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

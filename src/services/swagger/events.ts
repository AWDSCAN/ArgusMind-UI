// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Events GET /api/events — 游标分页：尾窗 / before_id / after_id（三模式互斥） */
export async function listEventsApiEventsGet(
  params: API.listEventsApiEventsGetParams,
  options?: { [key: string]: any },
) {
  return request<API.PageResultEventRead_>('/api/events', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** List OpenCode SSE events for an event GET /api/events/${param0}/opencode */
export async function listEventOpencodeEventsApiEventsEventIdOpencodeGet(
  params: {
    event_id: number;
    /** 滚动加载游标，仅返回 id 大于此值的事件 */
    after_id?: number;
    /** 可选分页大小，留空返回全部 */
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const { event_id: param0, ...queryParams } = params;
  return request<API.PageResultOpencodeEventRead_>(
    `/api/events/${param0}/opencode`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** Get Event GET /api/events/${param0} */
export async function getEventApiEventsEventIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEventApiEventsEventIdGetParams,
  options?: { [key: string]: any }
) {
  const { event_id: param0, ...queryParams } = params;
  return request<API.OkResponseEventRead_>(`/api/events/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Get Human Approval GET /api/events/human-approvals/${param0} */
export async function getHumanApprovalApiEventsHumanApprovalsInteractionIdGet(
  params: { interaction_id: string },
  options?: { [key: string]: any }
) {
  const { interaction_id: param0, ...queryParams } = params;
  return request<API.OkResponseAny_>(`/api/events/human-approvals/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Resolve Human Approval POST /api/events/human-approvals/${param0} */
export async function resolveHumanApprovalApiEventsHumanApprovalsInteractionIdPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.resolveHumanApprovalApiEventsHumanApprovalsInteractionIdPostParams,
  body: API.HumanApprovalDecisionRequest,
  options?: { [key: string]: any }
) {
  const { interaction_id: param0, ...queryParams } = params;
  return request<API.OkResponseHumanApprovalDecisionRead_>(
    `/api/events/human-approvals/${param0}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

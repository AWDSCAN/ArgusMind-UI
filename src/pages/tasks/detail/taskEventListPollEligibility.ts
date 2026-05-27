import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';

export type TaskEventListRow = AuditSessionDetailDTO['events'][number];

/**
 * 与 TaskEventsTimelineCard 一致：事件卡片上会展示状态类 Tag 的类型
 *（不含仅 information 成功、vulnerability 等不展示通用状态文案的情况）。
 */
export function taskEventListShowsStatusTag(event: TaskEventListRow): boolean {
  const actionTypeLabel = (event.actionType || '').trim().toLowerCase();
  const isHumanApprovalAction = actionTypeLabel === 'human_approval';
  const isInformationAction = actionTypeLabel === 'information';
  const isVulnerabilityAction = actionTypeLabel === 'vulnerability';
  const rawStatus = (
    event.finalStatus ||
    event.status ||
    'running'
  ).toLowerCase();
  const isFailedStatus = rawStatus === 'failed' || rawStatus === 'error';
  if (isHumanApprovalAction) return true;
  return (!isInformationAction || isFailedStatus) && !isVulnerabilityAction;
}

/** 与列表项上 merged 状态一致，用于判断是否为进行中 */
export function taskEventListAppearsRunning(event: TaskEventListRow): boolean {
  const actionTypeLabel = (event.actionType || '').trim().toLowerCase();
  const isInformationAction = actionTypeLabel === 'information';
  const isVulnerabilityAction = actionTypeLabel === 'vulnerability';
  const rawStatus = (
    event.finalStatus ||
    event.status ||
    'running'
  ).toLowerCase();
  const isFailedStatus = rawStatus === 'failed' || rawStatus === 'error';
  const mergedStatus = (
    (isInformationAction || isVulnerabilityAction) && !isFailedStatus
      ? 'completed'
      : rawStatus
  ).toLowerCase();
  return mergedStatus === 'running' || mergedStatus === 'in_progress';
}

/** 定时轮询应对其拉单条详情以刷新状态的事件（与事件 Tab 可见列表 filter 对齐） */
export function taskEventListShouldPollRunningDetail(
  event: TaskEventListRow,
): boolean {
  if (!(event.actionType || '').trim()) return false;
  return (
    taskEventListShowsStatusTag(event) && taskEventListAppearsRunning(event)
  );
}

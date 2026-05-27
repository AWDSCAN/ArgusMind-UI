import type { Dispatch, SetStateAction } from 'react';
import { mapEventReadToDetailEventAndToolCall } from '@/services/auditSessions';
import { getEventApiEventsEventIdGet } from '@/services/swagger/events';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';
import { taskEventListShouldPollRunningDetail } from './taskEventListPollEligibility';

/**
 * 增量列表不会重拉历史事件，对「展示状态且仍为 running」的事件按 id 拉详情并合并，
 * 用于更新 finalStatus / finishedAt 等。
 */
/** @returns 是否合并了至少一条事件状态补丁 */
export async function applyRunningDisplayedEventRefreshes(
  taskId: string,
  snapshot: AuditSessionDetailDTO,
  setDetail: Dispatch<SetStateAction<AuditSessionDetailDTO | null>>,
): Promise<boolean> {
  const targets = snapshot.events.filter((e) =>
    taskEventListShouldPollRunningDetail(e),
  );
  if (targets.length === 0) return false;

  const settled = await Promise.allSettled(
    targets.map((e) => getEventApiEventsEventIdGet({ event_id: Number(e.id) })),
  );

  const patches: API.EventRead[] = [];
  for (const s of settled) {
    if (s.status !== 'fulfilled') continue;
    const res = s.value;
    if (!res?.success || !res.data) continue;
    const row = res.data;
    if (row.task_id && row.task_id !== taskId) continue;
    patches.push(row);
  }
  if (patches.length === 0) return false;

  setDetail((prev) => {
    if (!prev) return prev;
    const byId = new Map(
      patches.map((p) => {
        const { event, toolCall } = mapEventReadToDetailEventAndToolCall(p);
        return [String(p.id), { event, toolCall }] as const;
      }),
    );
    return {
      ...prev,
      events: prev.events.map((ev) => byId.get(ev.id)?.event ?? ev),
      toolCalls: prev.toolCalls.map((tc) => byId.get(tc.id)?.toolCall ?? tc),
    };
  });
  return true;
}

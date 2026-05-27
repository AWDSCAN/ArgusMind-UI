import { DEMO_TASK_ID } from '../constants';
import eventsSnapshot from './raw/events.snapshot.json';
import graphSnapshot from './raw/graph.snapshot.json';
import humanApprovalSnapshot from './raw/human-approval.snapshot.json';
import logsSnapshot from './raw/logs.snapshot.json';
import opencodeSnapshot from './raw/opencode.snapshot.json';

/** GET /api/events?task_id=... — claimflow测试2 全量事件 */
export const demoTaskEvents = (eventsSnapshot.data ?? []) as API.EventRead[];

/** GET /api/logs?task_id=... */
export const demoTaskLogs = (logsSnapshot.data ?? []) as API.LogRead[];

/** GET /api/graph?task_id=... */
export const demoTaskAuditGraph = graphSnapshot.data ?? {
  nodes: [],
  edges: [],
};

/** GET /api/events/{id}/opencode — code_agent 事件 */
export const demoOpencodeEvents = (opencodeSnapshot.data ??
  []) as API.OpencodeEventRead[];

const interactionId =
  demoTaskEvents
    .find((e) => e.action_type === 'human_approval')
    ?.reason?.trim() ?? '';

export const demoHumanApprovalByInteractionId: Record<
  string,
  Record<string, unknown>
> = interactionId && humanApprovalSnapshot.data
  ? { [interactionId]: humanApprovalSnapshot.data as Record<string, unknown> }
  : {};

export function filterDemoTaskEvents(
  taskId: string,
  afterId?: number,
): API.EventRead[] {
  if (taskId !== DEMO_TASK_ID) return [];
  const sorted = [...demoTaskEvents].sort((a, b) => a.id - b.id);
  if (afterId === undefined || !Number.isFinite(afterId)) {
    return sorted;
  }
  return sorted.filter((e) => e.id > afterId);
}

export function getDemoEventById(eventId: number): API.EventRead | undefined {
  return demoTaskEvents.find((e) => e.id === eventId);
}

export function getDemoOpencodeEvents(
  eventId: number,
  afterId?: number,
): API.OpencodeEventRead[] {
  const sorted = [...demoOpencodeEvents]
    .filter((e) => e.event_id === eventId)
    .sort((a, b) => a.id - b.id);
  if (afterId === undefined || !Number.isFinite(afterId) || afterId <= 0) {
    return sorted;
  }
  return sorted.filter((e) => e.id > afterId);
}

export function getDemoTaskGraph(taskId: string) {
  if (taskId !== DEMO_TASK_ID) {
    return { success: true as const, data: { nodes: [], edges: [] } };
  }
  return { success: true as const, data: demoTaskAuditGraph };
}

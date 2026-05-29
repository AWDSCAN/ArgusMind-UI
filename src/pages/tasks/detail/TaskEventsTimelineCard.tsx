import { Card, Space, Spin } from 'antd';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';
import {
  eventTabCardBodyLayout,
  eventTimelineScrollArea,
  TASK_EVENT_TIMELINE_ROW_CLASS,
  TASK_EVENTS_SCROLL_CLASS,
} from './detailStyles';
import type { HumanApprovalPayload } from './planModel';
import { TaskEventTimelineRow } from './TaskEventTimelineRow';
import { TaskSessionSummaryStrip } from './TaskSessionSummaryStrip';
import {
  readEventListAutoScrollOnRefresh,
  writeEventListAutoScrollOnRefresh,
} from './taskDetailEventListPrefs';

const SCROLL_TOP_LOAD_THRESHOLD_PX = 80;

function buildEventsListFingerprint(
  events: AuditSessionDetailDTO['events'],
): string {
  if (!events.length) return '0';
  return events
    .map(
      (e) =>
        `${e.id}\t${e.finalStatus ?? ''}\t${e.status ?? ''}\t${e.finishedAt ?? ''}\t${e.startedAt}`,
    )
    .join('\u001e');
}

function isNearScrollBottom(el: HTMLElement, thresholdPx = 48): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdPx;
}

export type TaskEventsTimelineCardProps = {
  detail: AuditSessionDetailDTO;
  sortedEvents: AuditSessionDetailDTO['events'];
  humanApprovalMetaMap: Record<string, HumanApprovalPayload>;
  onOpenEventDetail: (eventId: string) => void;
  onRequestFocusAuditChainNode: (neo4jElementId: string) => void;
  hasMoreOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => Promise<void>;
};

/**
 * 事件时间线：游标分页 + content-visibility 懒绘制。
 * 首屏滚到底部后再启用向上翻历史，避免误触加载。
 */
export const TaskEventsTimelineCard: React.FC<TaskEventsTimelineCardProps> = ({
  detail,
  sortedEvents,
  humanApprovalMetaMap,
  onOpenEventDetail,
  onRequestFocusAuditChainNode,
  hasMoreOlder = false,
  loadingOlder = false,
  onLoadOlder,
}) => {
  const eventListScrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollOnRefresh, setAutoScrollOnRefresh] = useState(
    readEventListAutoScrollOnRefresh,
  );
  const previousEventsFingerprintRef = useRef<string | null>(null);
  const initialScrollDoneRef = useRef(false);
  const loadingOlderRef = useRef(false);
  const taskIdRef = useRef(detail.session.taskId);

  const eventsFingerprint = useMemo(
    () => buildEventsListFingerprint(sortedEvents),
    [sortedEvents],
  );

  useEffect(() => {
    if (taskIdRef.current !== detail.session.taskId) {
      taskIdRef.current = detail.session.taskId;
      initialScrollDoneRef.current = false;
      previousEventsFingerprintRef.current = null;
    }
  }, [detail.session.taskId]);

  useLayoutEffect(() => {
    const el = eventListScrollRef.current;
    if (!el || sortedEvents.length === 0) {
      return;
    }
    if (initialScrollDoneRef.current) {
      return;
    }
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      initialScrollDoneRef.current = true;
    });
  }, [eventsFingerprint, sortedEvents.length]);

  useLayoutEffect(() => {
    const fp = eventsFingerprint;
    const prev = previousEventsFingerprintRef.current;

    if (!autoScrollOnRefresh) {
      previousEventsFingerprintRef.current = fp;
      return;
    }

    if (prev === null) {
      previousEventsFingerprintRef.current = fp;
      return;
    }

    if (prev === fp) {
      return;
    }

    previousEventsFingerprintRef.current = fp;
    const el = eventListScrollRef.current;
    if (!el) return;
    if (!isNearScrollBottom(el)) {
      return;
    }
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [autoScrollOnRefresh, eventsFingerprint]);

  useEffect(() => {
    loadingOlderRef.current = loadingOlder;
  }, [loadingOlder]);

  const handleScroll = useCallback(() => {
    const el = eventListScrollRef.current;
    if (
      !el ||
      !initialScrollDoneRef.current ||
      !hasMoreOlder ||
      !onLoadOlder ||
      loadingOlderRef.current
    ) {
      return;
    }
    if (el.scrollTop > SCROLL_TOP_LOAD_THRESHOLD_PX) {
      return;
    }
    loadingOlderRef.current = true;
    const prevHeight = el.scrollHeight;
    void onLoadOlder()
      .catch(() => undefined)
      .finally(() => {
        loadingOlderRef.current = false;
        requestAnimationFrame(() => {
          const target = eventListScrollRef.current;
          if (!target) return;
          target.scrollTop = target.scrollHeight - prevHeight;
        });
      });
  }, [hasMoreOlder, onLoadOlder]);

  useEffect(() => {
    const el = eventListScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, eventsFingerprint]);

  const persistAutoScroll = (value: boolean) => {
    setAutoScrollOnRefresh(value);
    writeEventListAutoScrollOnRefresh(value);
  };

  return (
    <Card
      size="small"
      variant="borderless"
      style={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{ body: eventTabCardBodyLayout }}
    >
      <div
        ref={eventListScrollRef}
        className={TASK_EVENTS_SCROLL_CLASS}
        style={eventTimelineScrollArea}
      >
        {loadingOlder ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Spin size="small" tip="加载更早事件…" />
          </div>
        ) : null}
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {sortedEvents.map((event) => {
            const interactionId = (event.reason || '').trim();
            return (
              <div key={event.id} className={TASK_EVENT_TIMELINE_ROW_CLASS}>
                <TaskEventTimelineRow
                  event={event}
                  humanApprovalMeta={
                    interactionId
                      ? humanApprovalMetaMap[interactionId]
                      : undefined
                  }
                  onOpenEventDetail={onOpenEventDetail}
                  onRequestFocusAuditChainNode={onRequestFocusAuditChainNode}
                />
              </div>
            );
          })}
        </Space>
      </div>
      <TaskSessionSummaryStrip
        detail={detail}
        autoScrollOnRefresh={autoScrollOnRefresh}
        onAutoScrollOnRefreshChange={persistAutoScroll}
      />
    </Card>
  );
};

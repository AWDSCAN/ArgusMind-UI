import { Card, Space } from 'antd';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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

export type TaskEventsTimelineCardProps = {
  detail: AuditSessionDetailDTO;
  sortedEvents: AuditSessionDetailDTO['events'];
  humanApprovalMetaMap: Record<string, HumanApprovalPayload>;
  onOpenEventDetail: (eventId: string) => void;
  onRequestFocusAuditChainNode: (neo4jElementId: string) => void;
};

/**
 * 事件时间线：全量 DOM + content-visibility 懒绘制。
 * 比可变高度虚拟列表滚动条更稳；单条高度可变；离屏行由浏览器跳过布局/绘制。
 */
export const TaskEventsTimelineCard: React.FC<TaskEventsTimelineCardProps> = ({
  detail,
  sortedEvents,
  humanApprovalMetaMap,
  onOpenEventDetail,
  onRequestFocusAuditChainNode,
}) => {
  const eventListScrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollOnRefresh, setAutoScrollOnRefresh] = useState(
    readEventListAutoScrollOnRefresh,
  );
  const previousEventsFingerprintRef = useRef<string | null>(null);

  const eventsFingerprint = useMemo(
    () => buildEventsListFingerprint(sortedEvents),
    [sortedEvents],
  );

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
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [autoScrollOnRefresh, eventsFingerprint]);

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

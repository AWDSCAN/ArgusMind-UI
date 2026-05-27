import type { TabsProps } from 'antd';
import { Space, Tag } from 'antd';
import React from 'react';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';
import type { TaskCompletionStatusData } from '@/types/taskCompletionStatus';
import type { HumanApprovalPayload } from './planModel';
import { TaskCompletionTodoPanel } from './TaskCompletionTodoPanel';
import { TaskEventsTimelineCard } from './TaskEventsTimelineCard';
import { TaskRuntimeLogsPanel } from './TaskRuntimeLogsPanel';

export type BuildTaskDetailModuleTabsParams = {
  detail: AuditSessionDetailDTO;
  sortedEvents: AuditSessionDetailDTO['events'];
  humanApprovalMetaMap: Record<string, HumanApprovalPayload>;
  onOpenEventDetail: (eventId: string) => void;
  onRequestFocusAuditChainNode: (neo4jElementId: string) => void;
  completionStatus: TaskCompletionStatusData | null;
  completionLoading: boolean;
  completionError: boolean;
  completionCompleted: number;
  completionTotal: number;
  onReloadCompletionStatus: () => void;
};

export function buildTaskDetailModuleTabs({
  detail,
  sortedEvents,
  humanApprovalMetaMap,
  onOpenEventDetail,
  onRequestFocusAuditChainNode,
  completionStatus,
  completionLoading,
  completionError,
  completionCompleted,
  completionTotal,
  onReloadCompletionStatus,
}: BuildTaskDetailModuleTabsParams): NonNullable<TabsProps['items']> {
  const todoTagColor =
    completionTotal > 0 && completionCompleted === completionTotal
      ? 'success'
      : completionCompleted > 0
        ? 'processing'
        : 'default';

  return [
    {
      key: 'events',
      label: (
        <Space size={6}>
          <span>事件</span>
          <Tag color="blue">{sortedEvents.length}</Tag>
        </Space>
      ),
      children: (
        <TaskEventsTimelineCard
          detail={detail}
          sortedEvents={sortedEvents}
          humanApprovalMetaMap={humanApprovalMetaMap}
          onOpenEventDetail={onOpenEventDetail}
          onRequestFocusAuditChainNode={onRequestFocusAuditChainNode}
        />
      ),
    },
    {
      key: 'todo',
      label: (
        <Space size={6}>
          <span>TODO</span>
          {completionTotal > 0 ? (
            <Tag color={todoTagColor}>
              {completionCompleted}/{completionTotal}
            </Tag>
          ) : null}
        </Space>
      ),
      children: (
        <TaskCompletionTodoPanel
          data={completionStatus}
          loading={completionLoading}
          error={completionError}
          completedCount={completionCompleted}
          totalCount={completionTotal}
          onReload={onReloadCompletionStatus}
        />
      ),
    },
    {
      key: 'logs',
      label: <span>运行日志</span>,
      children: <TaskRuntimeLogsPanel logs={detail.logs} />,
    },
  ];
}

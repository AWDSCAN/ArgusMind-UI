import {
  ApartmentOutlined,
  BugOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import React, { memo } from 'react';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';
import {
  formatUtcForLocalDisplay,
  utcApiStringToEpochMs,
} from '@/utils/utcDateTimeDisplay';
import { EventTokenDeltaInline } from './eventTokenDeltaDisplay';
import type { HumanApprovalPayload } from './planModel';

function readVulNeo4jEleIdFromEventDetail(
  detail: AuditSessionDetailDTO['events'][number]['detail'],
): string | null {
  let ta = detail?.toolArguments;
  if (typeof ta === 'string') {
    try {
      ta = JSON.parse(ta) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (!ta || typeof ta !== 'object') return null;
  const raw = ta as Record<string, unknown>;
  const v = raw.vul_neo4j_ele_id ?? raw.vulNeo4jEleId;
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

export type TaskEventTimelineRowProps = {
  event: AuditSessionDetailDTO['events'][number];
  humanApprovalMeta?: HumanApprovalPayload;
  onOpenEventDetail: (eventId: string) => void;
  onRequestFocusAuditChainNode: (neo4jElementId: string) => void;
};

export const TaskEventTimelineRow = memo(function TaskEventTimelineRow({
  event,
  humanApprovalMeta,
  onOpenEventDetail,
  onRequestFocusAuditChainNode,
}: TaskEventTimelineRowProps) {
  const { token } = theme.useToken();

  const actionTypeLabel = event.actionType?.trim();
  const isHumanApprovalAction =
    (actionTypeLabel || '').toLowerCase() === 'human_approval';
  const interactionId = (event.reason || '').trim();
  const isPlanApproval =
    (humanApprovalMeta?.interaction_type || '').toLowerCase() === 'plan';
  const isInformationAction =
    (actionTypeLabel || '').toLowerCase() === 'information';
  const isVulnerabilityAction =
    (actionTypeLabel || '').toLowerCase() === 'vulnerability';
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
  const isCompleted =
    mergedStatus === 'completed' || mergedStatus === 'success';
  const isRunning =
    mergedStatus === 'running' || mergedStatus === 'in_progress';
  const isFailed = mergedStatus === 'failed' || mergedStatus === 'error';
  const statusColor = isCompleted
    ? 'success'
    : isFailed
      ? 'error'
      : isRunning
        ? 'processing'
        : 'default';
  const statusText =
    isInformationAction && !isFailedStatus
      ? 'completed'
      : event.finalStatus || event.status || 'running';
  const humanApprovalStatusText = isRunning
    ? '待确认'
    : isFailed || humanApprovalMeta?.approved === false
      ? '已拒绝'
      : '已确认';
  const humanApprovalStatusColor = isRunning
    ? 'processing'
    : isFailed || humanApprovalMeta?.approved === false
      ? 'error'
      : 'success';
  const decidedByText =
    humanApprovalMeta?.decided_by === 'timeout'
      ? '超时自动确认'
      : humanApprovalMeta?.decided_by === 'user'
        ? '用户确认'
        : '';
  const moduleLabel = (event.module || 'unknown').toUpperCase();
  const toolLabel = event.toolName?.trim();
  const startedAtText = formatUtcForLocalDisplay(event.startedAt);
  const startedMs = utcApiStringToEpochMs(event.startedAt);
  const finishedMs = utcApiStringToEpochMs(event.finishedAt);
  const durationSeconds =
    startedMs != null && finishedMs != null
      ? Math.max(0, (finishedMs - startedMs) / 1000)
      : null;
  const hasMeasurableSpan = durationSeconds !== null;
  const durationText =
    durationSeconds == null
      ? ''
      : Math.floor(durationSeconds / 60) > 0
        ? `${Math.floor(durationSeconds / 60)} m ${String(
            Math.floor(durationSeconds % 60),
          ).padStart(2, '0')} s`
        : `${String(Math.floor(durationSeconds % 60)).padStart(2, '0')} s`;
  const timeLineText = hasMeasurableSpan
    ? `${startedAtText} / ${durationText}`
    : startedAtText;

  const vulnHighlight = isVulnerabilityAction;
  const vulNeo4jEleId = isVulnerabilityAction
    ? readVulNeo4jEleIdFromEventDetail(event.detail)
    : null;
  const dotBackground = vulnHighlight
    ? token.colorWarning
    : isCompleted
      ? '#52c41a'
      : isFailed
        ? '#ff4d4f'
        : '#1677ff';
  const dotBoxShadow = vulnHighlight
    ? `0 0 0 1px ${token.colorWarningBorder}, 0 0 12px ${token.colorWarningOutline}`
    : isCompleted
      ? '0 0 0 1px rgba(82, 196, 26, 0.25), 0 0 10px rgba(82, 196, 26, 0.45)'
      : isFailed
        ? '0 0 0 1px rgba(255, 77, 79, 0.25), 0 0 10px rgba(255, 77, 79, 0.35)'
        : '0 0 0 1px rgba(22, 119, 255, 0.25), 0 0 10px rgba(22, 119, 255, 0.45)';
  const dotAnimation = isRunning
    ? vulnHighlight
      ? 'eventPulseWarning 1.8s ease-in-out infinite'
      : isFailed
        ? 'eventPulseError 1.8s ease-in-out infinite'
        : isCompleted
          ? 'eventPulseSuccess 1.8s ease-in-out infinite'
          : 'eventPulseProcessing 1.8s ease-in-out infinite'
    : undefined;
  const lineBackground = vulnHighlight
    ? `linear-gradient(180deg, ${token.colorWarning}47, ${token.colorWarning}14)`
    : isFailed
      ? 'linear-gradient(180deg, rgba(255,77,79,0.28), rgba(255,77,79,0.08))'
      : isCompleted
        ? 'linear-gradient(180deg, rgba(82,196,26,0.28), rgba(82,196,26,0.08))'
        : 'linear-gradient(180deg, rgba(22,119,255,0.28), rgba(22,119,255,0.08))';
  const lineBoxShadow = vulnHighlight
    ? `0 0 6px ${token.colorWarningOutline}`
    : isFailed
      ? '0 0 6px rgba(255,77,79,0.18)'
      : isCompleted
        ? '0 0 6px rgba(82,196,26,0.18)'
        : '0 0 6px rgba(22,119,255,0.18)';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '18px minmax(0, 1fr)',
        gap: 10,
        alignItems: 'start',
      }}
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 99,
            border: '2px solid #fff',
            background: dotBackground,
            boxShadow: dotBoxShadow,
            marginTop: 8,
            marginLeft: 1,
            animation: dotAnimation,
          }}
        />
        {isRunning ? (
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: -4,
              width: 22,
              height: 22,
              zIndex: 1,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="small" />
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 22,
            bottom: -14,
            left: 6,
            width: 1,
            background: lineBackground,
            boxShadow: lineBoxShadow,
          }}
        />
      </div>
      <Card
        size="small"
        styles={{ body: { paddingBlock: 10, paddingInline: 12 } }}
        style={
          vulnHighlight
            ? {
                border: `1px solid ${token.colorWarningBorder}`,
                background: token.colorWarningBg,
                boxShadow: `0 0 0 1px ${token.colorWarningOutline}, 0 2px 8px ${token.colorWarningOutline}`,
              }
            : undefined
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            width: '100%',
            minWidth: 0,
          }}
        >
          <Space
            direction="vertical"
            size={8}
            style={{ flex: '1 1 0', minWidth: 0, width: '100%' }}
          >
            <Typography.Text
              style={{
                fontSize: 14,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontWeight: vulnHighlight ? 600 : undefined,
              }}
              type={isFailed ? 'danger' : undefined}
            >
              {vulnHighlight ? (
                <Space size={6} align="start">
                  <BugOutlined
                    style={{
                      color: token.colorWarning,
                      marginTop: 3,
                      fontSize: 15,
                    }}
                  />
                  <span>
                    {isHumanApprovalAction && isPlanApproval
                      ? '确认审计计划'
                      : event.reason || '-'}
                  </span>
                </Space>
              ) : isHumanApprovalAction && isPlanApproval ? (
                '确认审计计划'
              ) : (
                event.reason || '-'
              )}
            </Typography.Text>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              <Space wrap size={[8, 6]}>
                <Tag color="default">{moduleLabel}</Tag>
                {actionTypeLabel && !isInformationAction ? (
                  <Tag
                    color={isVulnerabilityAction ? 'warning' : 'default'}
                    icon={isVulnerabilityAction ? <BugOutlined /> : undefined}
                  >
                    {actionTypeLabel}
                  </Tag>
                ) : null}
                {toolLabel ? <Tag color="default">{toolLabel}</Tag> : null}
                {isHumanApprovalAction ? (
                  <Tag color={humanApprovalStatusColor}>
                    {humanApprovalStatusText}
                  </Tag>
                ) : (!isInformationAction || isFailedStatus) &&
                  !isVulnerabilityAction ? (
                  <Tag color={statusColor}>{statusText}</Tag>
                ) : null}
                {isHumanApprovalAction && decidedByText ? (
                  <Tag color="default">{decidedByText}</Tag>
                ) : null}
              </Space>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'flex-end',
                  gap: 6,
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <EventTokenDeltaInline event={event} />
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                >
                  {timeLineText}
                </Typography.Text>
              </div>
            </div>
          </Space>
          <Space size={4} style={{ flexShrink: 0, marginTop: 2 }} align="start">
            {(actionTypeLabel || '').toLowerCase() === 'tool_call' ? (
              <Tooltip title="查看工具详情">
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<RightOutlined style={{ fontSize: 11 }} />}
                  onClick={() => void onOpenEventDetail(event.id)}
                  style={{
                    width: 22,
                    height: 22,
                    minWidth: 22,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorFillAlter,
                    color: token.colorTextSecondary,
                  }}
                />
              </Tooltip>
            ) : null}
            {isVulnerabilityAction && vulNeo4jEleId ? (
              <Tooltip title="在审计链路图中定位该结果节点">
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<ApartmentOutlined style={{ fontSize: 11 }} />}
                  onClick={() => onRequestFocusAuditChainNode(vulNeo4jEleId)}
                  style={{
                    width: 22,
                    height: 22,
                    minWidth: 22,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorFillAlter,
                    color: token.colorTextSecondary,
                  }}
                />
              </Tooltip>
            ) : null}
          </Space>
        </div>
      </Card>
    </div>
  );
});

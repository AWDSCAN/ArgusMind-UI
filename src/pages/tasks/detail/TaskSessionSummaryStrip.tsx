import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover, Space, Switch, Tag, Typography, theme } from 'antd';
import React, { useMemo } from 'react';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';
import { utcApiStringToEpochMs } from '@/utils/utcDateTimeDisplay';

function formatSessionRuntime(
  session: AuditSessionDetailDTO['session'],
): string {
  const startRaw = session.startedAt || session.createdAt;
  if (!startRaw) return '—';
  const start = utcApiStringToEpochMs(startRaw);
  if (start == null) return '—';
  const endMs = session.endedAt
    ? (utcApiStringToEpochMs(session.endedAt) ?? Date.now())
    : Date.now();
  if (!Number.isFinite(endMs)) return '—';
  const sec = Math.max(0, Math.floor((endMs - start) / 1000));
  if (sec < 60) return `${sec} 秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m} 分 ${String(s).padStart(2, '0')} 秒`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} 小时 ${mm} 分`;
}

export type TaskSessionSummaryStripProps = {
  detail: AuditSessionDetailDTO;
  /** 与「设置」联动：刷新详情后是否自动滚到事件列表底部 */
  autoScrollOnRefresh?: boolean;
  onAutoScrollOnRefreshChange?: (value: boolean) => void;
};

/** 事件列表底部：类 AI 对话底栏，只读展示会话摘要 */
export const TaskSessionSummaryStrip: React.FC<
  TaskSessionSummaryStripProps
> = ({ detail, autoScrollOnRefresh, onAutoScrollOnRefreshChange }) => {
  const { token } = theme.useToken();
  const { session, tokenUsage } = detail;
  const runtimeText = useMemo(() => formatSessionRuntime(session), [session]);

  const statusLower = (session.status || '').toLowerCase();
  const statusColor =
    statusLower === 'completed' || statusLower === 'success'
      ? 'success'
      : statusLower === 'failed' || statusLower === 'error'
        ? 'error'
        : statusLower === 'running' || statusLower === 'in_progress'
          ? 'processing'
          : 'default';

  const tokenTotal =
    session.tokenTotal != null ? String(session.tokenTotal) : '—';
  const mainInOut = `${tokenUsage.mainLlm.input} / ${tokenUsage.mainLlm.output}`;
  const agentInOut = `${tokenUsage.agent.input} / ${tokenUsage.agent.output}`;

  const showScrollSetting =
    typeof autoScrollOnRefresh === 'boolean' &&
    typeof onAutoScrollOnRefreshChange === 'function';

  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 'auto',
        padding: '12px 16px 14px',
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
        background: token.colorFillAlter,
        boxShadow: `0 -4px 14px ${token.colorFillSecondary}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              rowGap: 6,
              marginBottom: 8,
            }}
          >
            <Typography.Text
              strong
              ellipsis={{ tooltip: session.taskName }}
              style={{
                flex: '1 1 160px',
                minWidth: 0,
                fontSize: token.fontSize,
              }}
            >
              {session.taskName || '任务'}
            </Typography.Text>
            <Tag color={statusColor} style={{ marginInlineEnd: 0 }}>
              {session.status || '—'}
            </Tag>
          </div>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              lineHeight: token.lineHeightLG,
              display: 'block',
            }}
          >
            <Space
              size={6}
              wrap
              split={<span style={{ color: token.colorBorder }}>|</span>}
            >
              <span>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 'inherit' }}
                >
                  Token 总计{' '}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 'inherit', color: token.colorText }}
                >
                  {tokenTotal}
                </Typography.Text>
              </span>
              <span>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 'inherit' }}
                >
                  主模型 in / out{' '}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 'inherit', color: token.colorText }}
                >
                  {mainInOut}
                </Typography.Text>
              </span>
              <span>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 'inherit' }}
                >
                  Code Agent in / out{' '}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 'inherit', color: token.colorText }}
                >
                  {agentInOut}
                </Typography.Text>
              </span>
              <span>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 'inherit' }}
                >
                  运行时间{' '}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 'inherit', color: token.colorText }}
                >
                  {runtimeText}
                </Typography.Text>
              </span>
            </Space>
          </Typography.Text>
        </div>
        {showScrollSetting ? (
          <Popover
            placement="topRight"
            title="事件列表"
            content={
              <div style={{ maxWidth: 280 }}>
                <Space align="start">
                  <Switch
                    checked={autoScrollOnRefresh}
                    onChange={onAutoScrollOnRefreshChange}
                  />
                  <Typography.Text style={{ fontSize: 13 }}>
                    刷新任务数据后，自动将事件列表滚动到底部
                  </Typography.Text>
                </Space>
              </div>
            }
            trigger="click"
          >
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              aria-label="事件列表设置"
              style={{ flexShrink: 0, marginTop: -2 }}
            />
          </Popover>
        ) : null}
      </div>
    </div>
  );
};

import { Divider, Drawer, Empty, Space, Spin, Typography } from 'antd';
import React from 'react';
import type { OpencodeStreamItem } from '@/utils/opencodeEventsMerge';
import {
  OPENCODE_SCROLL_CLASS,
  OPENCODE_STREAM_MIN_HEIGHT,
  toolDetailCodeBlockStyle,
} from './detailStyles';
import { OpencodeExecutionStream } from './OpencodeExecutionStream';
import { formatAsExpandedJsonIfPossible } from './planModel';

export type TaskEventDetailDrawerProps = {
  open: boolean;
  selectedEventId: string;
  onClose: () => void;
  detailLoading: boolean;
  eventDetail: API.EventRead | null;
  isCodeAgentEventDetail: boolean;
  opencodeLoading: boolean;
  opencodeStreamScrollRef: React.RefObject<HTMLDivElement | null>;
  opencodeStreamMaxHeightPx: number | null;
  opencodeStreamItems: OpencodeStreamItem[];
};

export const TaskEventDetailDrawer: React.FC<TaskEventDetailDrawerProps> = ({
  open,
  selectedEventId,
  onClose,
  detailLoading,
  eventDetail,
  isCodeAgentEventDetail,
  opencodeLoading,
  opencodeStreamScrollRef,
  opencodeStreamMaxHeightPx,
  opencodeStreamItems,
}) => (
  <Drawer
    title={`事件详情 #${selectedEventId || '-'}`}
    open={open}
    onClose={onClose}
    width={760}
  >
    <Spin spinning={detailLoading}>
      {!eventDetail ? (
        <Empty description="暂无事件详情" />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>工具输入参数</Typography.Text>
            <pre style={toolDetailCodeBlockStyle}>
              <code>
                {formatAsExpandedJsonIfPossible(
                  eventDetail.detail?.tool_arguments ?? {},
                )}
              </code>
            </pre>
          </div>
          {!isCodeAgentEventDetail ? (
            <div>
              <Typography.Text strong>工具输出</Typography.Text>
              <pre style={toolDetailCodeBlockStyle}>
                <code>
                  {formatAsExpandedJsonIfPossible(
                    eventDetail.detail?.tool_output ?? '-',
                  )}
                </code>
              </pre>
            </div>
          ) : null}
          {isCodeAgentEventDetail ? (
            <>
              <Divider orientation="left" plain>
                OpenCode 执行流
              </Divider>
              <Spin spinning={opencodeLoading}>
                <div
                  ref={opencodeStreamScrollRef}
                  className={OPENCODE_SCROLL_CLASS}
                  style={{
                    maxHeight:
                      opencodeStreamMaxHeightPx != null
                        ? opencodeStreamMaxHeightPx
                        : 'min(72vh, calc(100dvh - 260px))',
                    minHeight: OPENCODE_STREAM_MIN_HEIGHT,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                >
                  <OpencodeExecutionStream items={opencodeStreamItems} />
                </div>
              </Spin>
            </>
          ) : null}
        </Space>
      )}
    </Spin>
  </Drawer>
);

import { CopyOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import React from 'react';
import {
  eventTimelineScrollArea,
  TASK_EVENTS_SCROLL_CLASS,
  toolDetailCodeBlockStyle,
} from './detailStyles';

export type TaskRuntimeLogsPanelProps = {
  logs: string;
};

/** 运行日志：填满左侧 Tab 高度，内容区内部滚动，无折叠。 */
export const TaskRuntimeLogsPanel: React.FC<TaskRuntimeLogsPanelProps> = ({
  logs,
}) => {
  const text = logs ?? '';

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '8px 16px 0',
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          disabled={!text.trim()}
          onClick={handleCopy}
        >
          复制
        </Button>
      </div>
      <div
        className={TASK_EVENTS_SCROLL_CLASS}
        style={{
          ...eventTimelineScrollArea,
          flex: 1,
          paddingTop: 8,
        }}
      >
        {text.trim() ? (
          <pre
            style={{
              ...toolDetailCodeBlockStyle,
              marginTop: 0,
              marginBottom: 0,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </pre>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无运行日志"
          />
        )}
      </div>
    </div>
  );
};

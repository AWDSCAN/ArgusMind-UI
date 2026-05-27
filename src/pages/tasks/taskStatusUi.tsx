import { Tag } from 'antd';
import React from 'react';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

type TaskStatusMeta = {
  text: string;
  dot: string;
  bg: string;
  fg: string;
};

export const taskStatusMeta: Record<TaskStatus, TaskStatusMeta> = {
  pending: {
    text: '待执行',
    dot: '#8c8c8c',
    bg: '#f5f5f5',
    fg: '#595959',
  },
  running: {
    text: '运行中',
    dot: '#1677ff',
    bg: '#eaf3ff',
    fg: '#1677ff',
  },
  paused: {
    text: '已暂停',
    dot: '#722ed1',
    bg: '#f9f0ff',
    fg: '#722ed1',
  },
  completed: {
    text: '已完成',
    dot: '#22c55e',
    bg: '#e9f8f0',
    fg: '#12a150',
  },
  failed: {
    text: '失败',
    dot: '#ef4444',
    bg: '#fff0f1',
    fg: '#ef4444',
  },
  cancelled: {
    text: '已取消',
    dot: '#faad14',
    bg: '#fff7e6',
    fg: '#d48806',
  },
};

export const taskStatusValueEnum = Object.fromEntries(
  Object.entries(taskStatusMeta).map(([key, { text }]) => [key, { text }]),
) as Record<TaskStatus, { text: string }>;

const fallbackMeta: TaskStatusMeta = {
  text: '',
  dot: '#8c8c8c',
  bg: '#f5f5f5',
  fg: '#595959',
};

export function TaskStatusTag({ status }: { status: string }) {
  const m = taskStatusMeta[status as TaskStatus];
  const text = m?.text ?? status;
  const { dot, bg, fg } = m ?? fallbackMeta;

  return (
    <Tag
      bordered={false}
      style={{
        background: bg,
        color: fg,
        marginInlineEnd: 0,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dot,
          marginRight: 6,
          verticalAlign: 'middle',
        }}
      />
      {text}
    </Tag>
  );
}

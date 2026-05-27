import {
  CheckCircleFilled,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import React from 'react';
import type {
  TaskLanguageCompletion,
  TaskRiskCategoryCompletion,
} from '@/types/taskCompletionStatus';

export type CompletionItemStatus =
  | 'completed'
  | 'running'
  | 'pending'
  | 'other';

export function normalizeCompletionStatus(
  status: string | undefined | null,
): CompletionItemStatus {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'success' || s === 'done') return 'completed';
  if (s === 'running' || s === 'in_progress' || s === 'processing') {
    return 'running';
  }
  if (s === 'pending' || s === 'waiting' || s === 'queued') return 'pending';
  return 'other';
}

export function isCompletionItemDone(
  status: string | undefined | null,
): boolean {
  return normalizeCompletionStatus(status) === 'completed';
}

export const completionStatusMeta: Record<
  CompletionItemStatus,
  { label: string; color: string; bg: string }
> = {
  completed: { label: '已完成', color: '#12a150', bg: '#e9f8f0' },
  running: { label: '进行中', color: '#1677ff', bg: '#eaf3ff' },
  pending: { label: '待开始', color: '#8c8c8c', bg: '#f5f5f5' },
  other: { label: '未知', color: '#8c8c8c', bg: '#f5f5f5' },
};

export function CompletionStatusIcon({
  status,
  size = 16,
}: {
  status: string | undefined | null;
  size?: number;
}) {
  const kind = normalizeCompletionStatus(status);
  const style = { fontSize: size };
  if (kind === 'completed') {
    return <CheckCircleFilled style={{ ...style, color: '#22c55e' }} />;
  }
  if (kind === 'running') {
    return <LoadingOutlined style={{ ...style, color: '#1677ff' }} spin />;
  }
  return (
    <ClockCircleOutlined style={{ ...style, color: 'rgba(0,0,0,0.25)' }} />
  );
}

export type CompletionTodoItem = {
  key: string;
  title: string;
  status: string;
  level?: number;
  sinkFinderCompleted?: boolean;
  kind: 'language' | 'risk';
};

export function flattenCompletionTodos(
  languages: TaskLanguageCompletion[],
): CompletionTodoItem[] {
  const items: CompletionTodoItem[] = [];
  for (const lang of languages) {
    items.push({
      key: `lang:${lang.node_id}`,
      title: lang.language || '未命名语言',
      status: lang.status,
      level: lang.level,
      kind: 'language',
    });
    for (const cat of lang.risk_categories ?? []) {
      items.push({
        key: `risk:${cat.node_id}`,
        title: cat.category_name || '未命名类别',
        status: cat.status,
        level: cat.level,
        sinkFinderCompleted: cat.sink_finder_completed,
        kind: 'risk',
      });
    }
  }
  return items;
}

export function countCompletionProgress(languages: TaskLanguageCompletion[]): {
  total: number;
  completed: number;
} {
  const items = flattenCompletionTodos(languages);
  const total = items.length;
  const completed = items.filter((i) => isCompletionItemDone(i.status)).length;
  return { total, completed };
}

export type GroupedLanguageTodos = {
  language: TaskLanguageCompletion;
  categories: TaskRiskCategoryCompletion[];
};

export function groupCompletionByLanguage(
  languages: TaskLanguageCompletion[],
): GroupedLanguageTodos[] {
  return languages.map((language) => ({
    language,
    categories: language.risk_categories ?? [],
  }));
}

export function completionLevelTag(level: number | undefined): ReactNode {
  if (level == null || !Number.isFinite(level)) return null;
  return (
    <span
      style={{
        fontSize: 11,
        lineHeight: '18px',
        padding: '0 6px',
        borderRadius: 4,
        background: 'rgba(0,0,0,0.04)',
        color: 'rgba(0,0,0,0.55)',
        fontWeight: 500,
      }}
    >
      L{level}
    </span>
  );
}

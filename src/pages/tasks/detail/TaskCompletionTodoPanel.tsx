import { ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Progress, Spin, Tag, Typography, theme } from 'antd';
import React, { useMemo } from 'react';
import type { TaskCompletionStatusData } from '@/types/taskCompletionStatus';
import {
  eventTimelineScrollArea,
  TASK_EVENTS_SCROLL_CLASS,
} from './detailStyles';
import {
  CompletionStatusIcon,
  completionLevelTag,
  completionStatusMeta,
  groupCompletionByLanguage,
  isCompletionItemDone,
  normalizeCompletionStatus,
} from './taskCompletionStatusUi';

export type TaskCompletionTodoPanelProps = {
  data: TaskCompletionStatusData | null;
  loading: boolean;
  error: boolean;
  completedCount: number;
  totalCount: number;
  onReload: () => void;
};

function StatusPill({ status }: { status: string }) {
  const kind = normalizeCompletionStatus(status);
  const meta = completionStatusMeta[kind];
  return (
    <span
      style={{
        fontSize: 11,
        lineHeight: '20px',
        padding: '0 8px',
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {meta.label}
    </span>
  );
}

type TodoRowProps = {
  title: string;
  status: string;
  level?: number;
  sinkFinderCompleted?: boolean;
  indent?: boolean;
};

const TodoRow: React.FC<TodoRowProps> = ({
  title,
  status,
  level,
  sinkFinderCompleted,
  indent,
}) => {
  const { token } = theme.useToken();
  const done = isCompletionItemDone(status);
  const running = normalizeCompletionStatus(status) === 'running';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: indent ? '8px 12px 8px 28px' : '10px 12px',
        borderRadius: 8,
        background: done
          ? 'rgba(34, 197, 94, 0.06)'
          : running
            ? 'rgba(22, 119, 255, 0.05)'
            : 'transparent',
        transition: 'background 0.2s ease',
      }}
    >
      <span style={{ marginTop: 2, flexShrink: 0 }}>
        <CompletionStatusIcon status={status} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Typography.Text
            strong={!done && !indent}
            delete={done}
            style={{
              margin: 0,
              color: done ? token.colorTextTertiary : token.colorText,
              fontSize: indent ? 13 : 14,
            }}
          >
            {title}
          </Typography.Text>
          {completionLevelTag(level)}
          {sinkFinderCompleted ? (
            <Tag
              bordered={false}
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: '18px',
                background: '#e6fffb',
                color: '#08979c',
              }}
            >
              Sink 已定位
            </Tag>
          ) : null}
        </div>
      </div>
      <StatusPill status={status} />
    </div>
  );
};

const LanguageGroupCard: React.FC<{
  language: string;
  status: string;
  level: number;
  categories: Array<{
    node_id: string;
    category_name: string;
    status: string;
    level: number;
    sink_finder_completed: boolean;
  }>;
}> = ({ language, status, level, categories }) => {
  const { token } = theme.useToken();
  const langDone = isCompletionItemDone(status);
  const catDone = categories.filter((c) =>
    isCompletionItemDone(c.status),
  ).length;

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom:
            categories.length > 0
              ? `1px solid ${token.colorBorderSecondary}`
              : undefined,
          background: langDone
            ? 'linear-gradient(90deg, rgba(34,197,94,0.08), transparent)'
            : 'linear-gradient(90deg, rgba(22,119,255,0.06), transparent)',
        }}
      >
        <TodoRow title={language} status={status} level={level} />
        {categories.length > 0 ? (
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, paddingLeft: 40, display: 'block' }}
          >
            风险类别 {catDone}/{categories.length} 已完成
          </Typography.Text>
        ) : null}
      </div>
      {categories.length > 0 ? (
        <div>
          {categories.map((cat) => (
            <TodoRow
              key={cat.node_id}
              indent
              title={cat.category_name}
              status={cat.status}
              level={cat.level}
              sinkFinderCompleted={cat.sink_finder_completed}
            />
          ))}
        </div>
      ) : (
        <Typography.Text
          type="secondary"
          style={{ display: 'block', padding: '12px 16px', fontSize: 12 }}
        >
          暂无风险类别
        </Typography.Text>
      )}
    </div>
  );
};

/** 任务完成度 TODO 面板：语言 → 风险类别层级清单 */
export const TaskCompletionTodoPanel: React.FC<
  TaskCompletionTodoPanelProps
> = ({ data, loading, error, completedCount, totalCount, onReload }) => {
  const { token } = theme.useToken();
  const groups = useMemo(
    () => groupCompletionByLanguage(data?.languages ?? []),
    [data?.languages],
  );

  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          padding: '12px 16px 8px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div>
            <Typography.Text strong style={{ fontSize: 14 }}>
              审计进度
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ display: 'block', fontSize: 12, marginTop: 2 }}
            >
              {completedCount} / {totalCount} 项已完成
            </Typography.Text>
          </div>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void onReload()}
          >
            刷新
          </Button>
        </div>
        <Progress
          percent={percent}
          size="small"
          strokeColor={
            percent === 100 ? '#22c55e' : { from: '#1677ff', to: '#69b1ff' }
          }
          format={() => `${percent}%`}
        />
      </div>

      <div
        className={TASK_EVENTS_SCROLL_CLASS}
        style={{
          ...eventTimelineScrollArea,
          flex: 1,
          paddingTop: 12,
        }}
      >
        <Spin spinning={loading && !data}>
          {error && !data ? (
            <Empty
              description="加载完成度失败"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button size="small" onClick={() => void onReload()}>
                重试
              </Button>
            </Empty>
          ) : groups.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无待办项"
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingBottom: 8,
              }}
            >
              {groups.map(({ language, categories }) => (
                <LanguageGroupCard
                  key={language.node_id}
                  language={language.language || '未命名语言'}
                  status={language.status}
                  level={language.level}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

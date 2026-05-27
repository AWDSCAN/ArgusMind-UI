import {
  ApartmentOutlined,
  PartitionOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Switch, Typography } from 'antd';
import React from 'react';
import FilterPopover, { type FilterState } from './FilterPopover';

type Props = {
  taskName?: string;
  nodeCount: number;
  edgeCount: number;
  visibleNodeCount: number;
  filter: FilterState;
  onFilterChange: (next: FilterState) => void;
  onReset: () => void;
  /** 一键恢复 ELK 自动布局 */
  onRestoreLayout?: () => void;
  restoreLayoutLoading?: boolean;
  /** When the data has not loaded yet hide the secondary line */
  loading?: boolean;
  /** 拓扑出现新节点时自动 fit 到新节点 */
  followLatestNode?: boolean;
  onFollowLatestNodeChange?: (next: boolean) => void;
  /** Toolbar controls on the far right (after 重置视图) */
  headerExtraRight?: React.ReactNode;
  /** 是否展示「跟随最新」与过滤（漏洞详情子图可关闭） */
  showFilterAndFollowLatest?: boolean;
};

const Header: React.FC<Props> = ({
  taskName,
  nodeCount,
  edgeCount,
  visibleNodeCount,
  filter,
  onFilterChange,
  onReset,
  onRestoreLayout,
  restoreLayoutLoading,
  loading,
  followLatestNode = false,
  onFollowLatestNodeChange,
  headerExtraRight,
  showFilterAndFollowLatest = true,
}) => {
  const filtered = visibleNodeCount !== nodeCount;
  return (
    <header
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow:
          '0 1px 2px 0 rgba(20, 27, 36, 0.06), 0 1px 3px 0 rgba(20, 27, 36, 0.10)',
        gap: 8,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            flex: '0 0 auto',
            background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            boxShadow:
              'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(15, 23, 42, 0.06)',
          }}
        >
          <PartitionOutlined style={{ fontSize: 17, color: '#4338ca' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            代码审计链路图
            {taskName ? (
              <>
                <Typography.Text type="secondary" style={{ marginLeft: 6 }}>
                  /
                </Typography.Text>
                <span
                  style={{
                    marginLeft: 6,
                    color: '#155eef',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  }}
                >
                  {taskName}
                </span>
              </>
            ) : null}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {loading ? (
              '正在加载审计链路图…'
            ) : filtered ? (
              <>
                显示{' '}
                <span style={{ color: '#1d4ed8', fontWeight: 500 }}>
                  {visibleNodeCount}
                </span>
                <span style={{ color: '#94a3b8' }}> / </span>
                <span style={{ color: '#334155', fontWeight: 500 }}>
                  {nodeCount}
                </span>{' '}
                个节点 ·{' '}
                <span style={{ color: '#334155', fontWeight: 500 }}>
                  {edgeCount}
                </span>{' '}
                条关系
              </>
            ) : (
              <>
                共{' '}
                <span style={{ color: '#334155', fontWeight: 500 }}>
                  {nodeCount}
                </span>{' '}
                个节点 ·{' '}
                <span style={{ color: '#334155', fontWeight: 500 }}>
                  {edgeCount}
                </span>{' '}
                条关系
                <span className="audit-chain-header-tip">
                  {' '}
                  · 可拖拽节点调整位置
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '0 0 auto',
        }}
      >
        {showFilterAndFollowLatest ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, whiteSpace: 'nowrap' }}
            >
              跟随最新
            </Typography.Text>
            <Switch
              size="small"
              checked={followLatestNode}
              onChange={(v) => onFollowLatestNodeChange?.(v)}
            />
          </div>
        ) : null}
        {showFilterAndFollowLatest ? (
          <FilterPopover value={filter} onChange={onFilterChange} />
        ) : null}
        {onRestoreLayout ? (
          <Button
            size="small"
            icon={<ApartmentOutlined />}
            loading={restoreLayoutLoading}
            disabled={loading || nodeCount === 0}
            onClick={onRestoreLayout}
          >
            自动布局
          </Button>
        ) : null}
        <Button size="small" icon={<ReloadOutlined />} onClick={onReset}>
          重置视图
        </Button>
        {headerExtraRight}
      </div>
    </header>
  );
};

export default Header;

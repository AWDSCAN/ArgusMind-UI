import {
  CompressOutlined,
  ExpandOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import React, { type RefObject } from 'react';
import AuditChainCanvas, {
  type AuditChainFocusNodeRequest,
} from '@/components/AuditChainCanvas';
import type { AuditChainRawGraph } from '@/types/auditSessionDetail';
import {
  TASK_DETAIL_AUDIT_CHAIN_TRAY_CLASS,
  TASK_DETAIL_AUDIT_CHAIN_TRAY_PADDING,
  TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
} from './detailStyles';

export type TaskDetailAuditChainTrayProps = {
  trayRef: RefObject<HTMLDivElement | null>;
  pageExpand: boolean;
  browserFullscreen: boolean;
  onTogglePageExpand: () => void;
  onToggleBrowserFullscreen: () => void;
  graphKey: string;
  raw: AuditChainRawGraph | null;
  taskName?: string;
  focusNodeRequest?: AuditChainFocusNodeRequest | null;
  /** 是否展示画布「跟随最新」与过滤（漏洞详情传 false） */
  showFilterAndFollowLatest?: boolean;
};

/** 任务 / 漏洞详情右侧：审计链路思维图画布托盘（与任务详情页一致） */
const TaskDetailAuditChainTray: React.FC<TaskDetailAuditChainTrayProps> = ({
  trayRef,
  pageExpand,
  browserFullscreen,
  onTogglePageExpand,
  onToggleBrowserFullscreen,
  graphKey,
  raw,
  taskName,
  focusNodeRequest,
  showFilterAndFollowLatest = true,
}) => (
  <div
    ref={trayRef}
    className={TASK_DETAIL_AUDIT_CHAIN_TRAY_CLASS}
    style={{
      flex: pageExpand ? '1 1 100%' : '1 1 400px',
      maxWidth: '100%',
      overflow: 'hidden',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      height: TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
      maxHeight: TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
      padding: TASK_DETAIL_AUDIT_CHAIN_TRAY_PADDING,
      background: 'var(--ant-color-fill-quaternary)',
      borderRadius: 'var(--ant-border-radius-lg)',
      boxShadow: 'inset 0 0 0 1px var(--ant-color-split)',
      ...(pageExpand ? { width: '100%' } : {}),
    }}
  >
    <Card
      size="small"
      variant="borderless"
      styles={{
        body: {
          padding: 0,
          flex: 1,
          minHeight: 0,
          minWidth: 320,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      style={{
        flex: 1,
        minHeight: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ant-color-bg-container)',
        border: '1px solid var(--ant-color-split)',
        borderRadius: 'var(--ant-border-radius-lg)',
        boxShadow:
          '0 0 0 1px rgba(15, 23, 42, 0.06), 0 4px 14px rgba(15, 23, 42, 0.1)',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AuditChainCanvas
          graphKey={graphKey}
          raw={raw}
          taskName={taskName}
          focusNodeRequest={focusNodeRequest}
          showFilterAndFollowLatest={showFilterAndFollowLatest}
          headerExtraRight={
            <Space size={4}>
              <Button
                type="text"
                size="small"
                title={pageExpand ? '退出页内放大' : '页内放大'}
                aria-label={pageExpand ? '退出页内放大' : '页内放大'}
                icon={pageExpand ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={onTogglePageExpand}
              />
              <Button
                type="text"
                size="small"
                title={browserFullscreen ? '退出全屏' : '全屏'}
                aria-label={browserFullscreen ? '退出全屏' : '全屏'}
                icon={
                  browserFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={() => void onToggleBrowserFullscreen()}
              />
            </Space>
          }
        />
      </div>
    </Card>
  </div>
);

export default TaskDetailAuditChainTray;

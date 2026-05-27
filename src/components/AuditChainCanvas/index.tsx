import '@xyflow/react/dist/style.css';
import './styles.css';

import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import type { AuditChainRawGraph } from '@/types/auditSessionDetail';
import type { AuditChainFocusNodeRequest } from './AuditChainInner';
import AuditChainInner from './AuditChainInner';

export type { AuditChainFocusNodeRequest };

export type AuditChainCanvasProps = {
  /** 用于切换任务时重置内部选中态与适配视图 */
  graphKey: string;
  /** 后端 `/api/graph` 返回的原始 Neo4j 图谱；null 时显示空态 */
  raw: AuditChainRawGraph | null;
  taskName?: string;
  /** 顶部工具栏最右侧额外内容（如图内全屏按钮） */
  headerExtraRight?: React.ReactNode;
  /** 从外部请求聚焦指定 elementId 的节点（与在画布内点击该节点一致） */
  focusNodeRequest?: AuditChainFocusNodeRequest | null;
  /** 是否展示「跟随最新」与过滤（默认 true；漏洞详情子图传 false） */
  showFilterAndFollowLatest?: boolean;
};

/**
 * 审计链路 · 代码审计图数据库画布
 *
 * Workflow 编辑器风格的只读节点/连线视图：
 * - ELK layered 自动布局（左到右）
 * - 节点类型 / 关系类型用色彩区分，并附 Legend
 * - 点击节点高亮其完整上下游链路，并 fit-view 聚焦
 * - 右上角过滤（节点状态 / verdict / verification）联动 fit-view
 * - 右侧详情面板展示节点原始 props
 */
const AuditChainCanvas: React.FC<AuditChainCanvasProps> = ({
  graphKey,
  raw,
  taskName,
  headerExtraRight,
  focusNodeRequest,
  showFilterAndFollowLatest = true,
}) => {
  return (
    <div
      className="audit-chain-canvas-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        contain: 'layout paint',
      }}
    >
      <ReactFlowProvider>
        <AuditChainInner
          graphKey={graphKey}
          raw={raw}
          taskName={taskName}
          headerExtraRight={headerExtraRight}
          focusNodeRequest={focusNodeRequest}
          showFilterAndFollowLatest={showFilterAndFollowLatest}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default AuditChainCanvas;

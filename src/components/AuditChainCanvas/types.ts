import type { Edge, Node } from '@xyflow/react';
import type {
  AuditChainEdgeType,
  AuditChainNodeLabel,
} from '@/types/auditSessionDetail';
import type { RunStatus } from './constants';

export type AuditFlowNodeData = {
  label: AuditChainNodeLabel;
  title: string;
  subtitle?: string;
  status?: RunStatus;
  raw: Record<string, any>;
  /** Set when another node is selected and this node is NOT in its chain. */
  dimmed?: boolean;
  /** Set when this node is on the selection's ancestor/descendant chain. */
  highlighted?: boolean;
  [key: string]: unknown;
};

export type AuditFlowEdgeData = {
  kind: AuditChainEdgeType;
  /** Edge connects two nodes on the selected chain → emphasize. */
  highlighted?: boolean;
  /** A node is selected but this edge is NOT on its chain → fade. */
  dimmed?: boolean;
  /** 任一端点为 SAFE 分析结果时，覆盖默认关系色 */
  strokeOverride?: string;
  [key: string]: unknown;
};

export type AuditFlowNode = Node<AuditFlowNodeData, 'audit'>;
export type AuditFlowEdge = Edge<AuditFlowEdgeData, 'audit'>;

/** 与 Knowledge / ChainNode / SinkFlowNode 相连的隐藏 AuditInfo 节点 */
export type ConnectedAuditInfo = {
  elementId: string;
  title: string;
  subtitle?: string;
  props: Record<string, unknown>;
};

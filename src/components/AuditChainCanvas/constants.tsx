import {
  AlertFilled,
  BookOutlined,
  BugFilled,
  CheckCircleFilled,
  CodeOutlined,
  ConsoleSqlOutlined,
  EnvironmentFilled,
  FlagFilled,
  InfoCircleFilled,
  LinkOutlined,
} from '@ant-design/icons';
import type React from 'react';
import type {
  AuditChainEdgeType,
  AuditChainNodeLabel,
} from '@/types/auditSessionDetail';

export type RunStatus = 'completed' | 'running' | 'pending' | 'failed';

export type NodeStyle = {
  /** Ant Design icon component for the node header badge */
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
  /** Tinted background for the icon badge */
  iconBg: string;
  /** Icon stroke color */
  iconColor: string;
  /** Display accent color for the minimap / hover state */
  accent: string;
  /** Localized human-readable label */
  label: string;
};

/** Style table indexed by `labels[0]` (the demo's primary Neo4j label) */
export const NODE_STYLE: Record<AuditChainNodeLabel, NodeStyle> = {
  Task: {
    Icon: FlagFilled,
    iconBg: '#eef2ff',
    iconColor: '#6366f1',
    accent: '#6366f1',
    label: '审计任务',
  },
  AuditStage: {
    Icon: CheckCircleFilled,
    iconBg: '#eff6ff',
    iconColor: '#155eef',
    accent: '#155eef',
    label: '审计阶段',
  },
  Language: {
    Icon: CodeOutlined,
    iconBg: '#fff7ed',
    iconColor: '#f97316',
    accent: '#f97316',
    label: '编程语言',
  },
  RiskCategory: {
    Icon: AlertFilled,
    iconBg: '#fef2f2',
    iconColor: '#f04438',
    accent: '#f04438',
    label: '风险类别',
  },
  SinkFlowNode: {
    Icon: EnvironmentFilled,
    iconBg: '#fffbeb',
    iconColor: '#f79009',
    accent: '#f79009',
    label: 'Sink 节点',
  },
  ChainNode: {
    Icon: LinkOutlined,
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    accent: '#7c3aed',
    label: '调用链节点',
  },
  Knowledge: {
    Icon: BookOutlined,
    iconBg: '#f0fdfa',
    iconColor: '#0d9488',
    accent: '#0d9488',
    label: '知识库',
  },
  AuditInfo: {
    Icon: InfoCircleFilled,
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    accent: '#0284c7',
    label: '审计信息',
  },
  AnalysisResult: {
    Icon: BugFilled,
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    accent: '#e11d48',
    label: '分析结果',
  },
};

export const FALLBACK_STYLE: NodeStyle = {
  Icon: ConsoleSqlOutlined,
  iconBg: '#f8fafc',
  iconColor: '#475467',
  accent: '#475467',
  label: '未知',
};

export type StatusStyle = {
  dot: string;
  ring: string;
  text: string;
  label: string;
  animated?: boolean;
};

export const STATUS_STYLE: Record<RunStatus, StatusStyle> = {
  completed: {
    dot: '#10b981',
    ring: '#a7f3d0',
    text: '#059669',
    label: '已完成',
  },
  running: {
    dot: '#3b82f6',
    ring: '#bfdbfe',
    text: '#1d4ed8',
    label: '执行中',
    animated: true,
  },
  pending: {
    dot: '#cbd5e1',
    ring: '#e2e8f0',
    text: '#64748b',
    label: '等待中',
  },
  failed: {
    dot: '#ef4444',
    ring: '#fecaca',
    text: '#b91c1c',
    label: '失败',
  },
};

export const EDGE_LABEL: Record<AuditChainEdgeType, string> = {
  HAS_STAGE: '阶段',
  HAS_LANGUAGE: '语言',
  HAS_RISK_CATEGORY: '风险',
  HAS_SINK: 'Sink',
  HAS_KNOWLEDGE: '知识',
  HAS_AUDIT_INFO: '审计信息',
  HAS_RESULT: '结果',
  FLOW: '调用',
};

export const EDGE_COLOR: Record<AuditChainEdgeType, string> = {
  HAS_STAGE: '#155eef',
  HAS_LANGUAGE: '#f97316',
  HAS_RISK_CATEGORY: '#f04438',
  HAS_SINK: '#f79009',
  HAS_KNOWLEDGE: '#0d9488',
  HAS_AUDIT_INFO: '#0284c7',
  HAS_RESULT: '#e11d48',
  FLOW: '#94a3b8',
};

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 96;

export const KNOWN_EDGE_TYPES: AuditChainEdgeType[] = [
  'HAS_STAGE',
  'HAS_LANGUAGE',
  'HAS_RISK_CATEGORY',
  'HAS_SINK',
  'HAS_KNOWLEDGE',
  'HAS_AUDIT_INFO',
  'HAS_RESULT',
  'FLOW',
];

/** Edge type guard — treat unknown relationship strings as plain FLOW */
export function asEdgeKind(type: string): AuditChainEdgeType {
  return (KNOWN_EDGE_TYPES as string[]).includes(type)
    ? (type as AuditChainEdgeType)
    : 'FLOW';
}

const KNOWN_NODE_LABELS: AuditChainNodeLabel[] = [
  'Task',
  'AuditStage',
  'Language',
  'RiskCategory',
  'SinkFlowNode',
  'ChainNode',
  'Knowledge',
  'AuditInfo',
  'AnalysisResult',
];

/** Pick first known label from `labels[]`, fall back to `'Task'` */
export function asNodeLabel(labels: string[]): AuditChainNodeLabel | null {
  for (const l of labels) {
    if ((KNOWN_NODE_LABELS as string[]).includes(l)) {
      return l as AuditChainNodeLabel;
    }
  }
  return null;
}

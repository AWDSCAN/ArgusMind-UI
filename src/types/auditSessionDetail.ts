/**
 * 审计会话详情（前端 + Mock 对齐）。
 * 审计链路图数据来自 Neo4j 图数据库（`/api/graph?task_id=...`），节点/关系结构保持
 * `elementId / labels / props` 与 `type / start / end / props` 的原貌。
 */

/** 审计链路图中节点的业务标签（来自 Neo4j `labels[0]`） */
export type AuditChainNodeLabel =
  | 'Task'
  | 'AuditStage'
  | 'Language'
  | 'RiskCategory'
  | 'SinkFlowNode'
  | 'ChainNode'
  | 'Knowledge'
  | 'AuditInfo'
  | 'AnalysisResult';

/** 审计链路图中关系的业务类型（来自 Neo4j `type`） */
export type AuditChainEdgeType =
  | 'HAS_STAGE'
  | 'HAS_LANGUAGE'
  | 'HAS_RISK_CATEGORY'
  | 'HAS_SINK'
  | 'HAS_KNOWLEDGE'
  | 'HAS_AUDIT_INFO'
  | 'HAS_RESULT'
  | 'FLOW';

/** 审计链路图节点（与 Neo4j 节点对齐） */
export type AuditChainRawNode = {
  elementId: string;
  labels: string[];
  props: Record<string, any>;
};

/** 审计链路图边（与 Neo4j 关系对齐） */
export type AuditChainRawEdge = {
  elementId: string;
  type: string;
  start: string;
  end: string;
  props: Record<string, any>;
};

/** 后端 `/api/graph` 返回结构（与代码审计程序输出图谱保持一致） */
export type AuditChainRawGraph = {
  nodes: AuditChainRawNode[];
  edges: AuditChainRawEdge[];
};

export type AuditSessionDetailDTO = {
  session: {
    id: string;
    taskId: string;
    taskName: string;
    projectName: string;
    status: string;
    createdAt?: string;
    startedAt?: string;
    endedAt?: string;
    tokenTotal?: number;
    tokenMainLlm?: number;
    tokenAgent?: number;
  };
  events: Array<{
    id: string;
    taskId?: string;
    module: string;
    actionType: string;
    toolName: string;
    status: string;
    reason: string;
    finalStatus: string;
    startedAt: string;
    finishedAt?: string;
    llmInputDelta: number;
    llmOutputDelta: number;
    codeAgentInputDelta: number;
    codeAgentOutputDelta: number;
    detail?: {
      toolArguments?: Record<string, any>;
      toolOutput?: string;
      codeAgentChainOfThought?: Record<string, any>[];
    };
  }>;
  toolCalls: Array<{
    id: string;
    name: string;
    time: string;
    inputSummary: string;
    outputSummary: string;
    fullInput: string;
    fullOutput: string;
    status: string;
    durationMs: number;
  }>;
  todos: Array<{ id: string; text: string; done: boolean }>;
  tokenUsage: {
    mainLlm: { input: number; output: number };
    agent: { input: number; output: number };
  };
  logs: string;
  /**
   * 审计链路图原始数据（Neo4j 图谱）。
   * 后端 `/api/graph?task_id=...` 返回，未返回时为 `null`，由前端给出空态。
   */
  auditChainGraph: AuditChainRawGraph | null;
};

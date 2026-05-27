import type {
  AuditChainRawGraph,
  AuditSessionDetailDTO,
} from '../src/types/auditSessionDetail';
import {
  argusStore,
  type AuditSessionRow,
  type TaskRow,
} from './argusStore';

function baseDetail(
  session: AuditSessionRow,
  task?: TaskRow,
): AuditSessionDetailDTO {
  const tokenTotal = task?.tokenUsed ?? 0;
  const mainIn = Math.round(tokenTotal * 0.35);
  const mainOut = Math.round(tokenTotal * 0.25);
  const agIn = Math.round(tokenTotal * 0.22);
  const agOut = Math.round(tokenTotal * 0.18);

  return {
    session: {
      id: session.id,
      taskId: session.taskId,
      taskName: session.taskName,
      projectName: session.projectName,
      status: session.status,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      tokenTotal,
      tokenMainLlm: mainIn + mainOut,
      tokenAgent: agIn + agOut,
    },
    events: [],
    toolCalls: [
      {
        id: 't1',
        name: 'code_search',
        time: session.startedAt ?? session.createdAt,
        inputSummary: 'query=execSQL OR Statement',
        outputSummary: '12 个文件命中',
        fullInput: JSON.stringify(
          { query: 'execSQL OR Statement', path: 'src/' },
          null,
          2,
        ),
        fullOutput: JSON.stringify(
          {
            hits: Array.from({ length: 12 }, (_, i) => `src/Example${i}.java`),
          },
          null,
          2,
        ),
        status: 'ok',
        durationMs: 842,
      },
    ],
    todos: [
      { id: 'todo-1', text: '完成入口点枚举', done: true },
      { id: 'todo-2', text: '梳理 SQL 拼接 sink', done: false },
      { id: 'todo-3', text: '输出初步漏洞列表', done: false },
    ],
    tokenUsage: {
      mainLlm: { input: mainIn, output: mainOut },
      agent: { input: agIn, output: agOut },
    },
    logs: `[INFO] session=${session.id} task=${session.taskId} started\n[WARN] 部分依赖无法解析，已跳过 3 个测试目录\n[INFO] tool code_search ok 842ms\n`,
    auditChainGraph: defaultAuditChainGraph(session),
  };
}

function defaultAuditChainGraph(session: AuditSessionRow): AuditChainRawGraph {
  return {
    nodes: [
      {
        elementId: 'task',
        labels: ['Task'],
        props: { name: session.taskName, project_id: session.projectName },
      },
      {
        elementId: 'stage-collect',
        labels: ['AuditStage'],
        props: { name: 'Information Collection', status: 'completed' },
      },
      {
        elementId: 'stage-plan',
        labels: ['AuditStage'],
        props: { name: 'make a plan', status: 'completed' },
      },
      {
        elementId: 'lang-js',
        labels: ['Language'],
        props: { name: 'JavaScript', level: 1, status: 'completed' },
      },
      {
        elementId: 'risk-sqli',
        labels: ['RiskCategory'],
        props: {
          category_name: 'sql_injection',
          level: 1,
          risk_description: '存在 SQL 拼接风险',
          status: 'running',
        },
      },
    ],
    edges: [
      {
        elementId: 'e1',
        type: 'HAS_STAGE',
        start: 'task',
        end: 'stage-collect',
        props: {},
      },
      {
        elementId: 'e2',
        type: 'HAS_STAGE',
        start: 'task',
        end: 'stage-plan',
        props: {},
      },
      {
        elementId: 'e3',
        type: 'HAS_LANGUAGE',
        start: 'stage-plan',
        end: 'lang-js',
        props: {},
      },
      {
        elementId: 'e4',
        type: 'HAS_RISK_CATEGORY',
        start: 'lang-js',
        end: 'risk-sqli',
        props: {},
      },
    ],
  };
}

export function buildAuditSessionDetail(
  session: AuditSessionRow,
): AuditSessionDetailDTO {
  const task = argusStore.tasks.find((t) => t.id === session.taskId);
  return baseDetail(session, task);
}

/**
 * 任务与审计会话共享内存（Mock），保证 sessionId 一致。
 */

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ScanType = 'full' | 'incremental' | 'dependency';

export type TaskRow = {
  id: string;
  sessionId: string;
  name: string;
  projectId: string;
  projectName: string;
  scanType: ScanType;
  status: TaskStatus;
  creator: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  vulnCount?: number;
  tokenUsed?: number;
};

export type AuditSessionRow = {
  id: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
};

const now = () => new Date().toISOString();

export const argusStore: { tasks: TaskRow[]; sessions: AuditSessionRow[] } = {
  tasks: [
    {
      id: 'task-1',
      sessionId: 'sess-1',
      name: '全量安全审计',
      projectId: 'proj-1',
      projectName: '示例电商后端',
      scanType: 'full',
      status: 'completed',
      creator: '张三',
      createdAt: now(),
      startedAt: now(),
      endedAt: now(),
      vulnCount: 12,
      tokenUsed: 42800,
    },
    {
      id: 'task-2',
      sessionId: 'sess-2',
      name: '依赖项扫描',
      projectId: 'proj-2',
      projectName: '内部工具链',
      scanType: 'dependency',
      status: 'running',
      creator: '李四',
      createdAt: now(),
      startedAt: now(),
      vulnCount: 0,
      tokenUsed: 12000,
    },
  ],
  sessions: [
    {
      id: 'sess-1',
      taskId: 'task-1',
      taskName: '全量安全审计',
      projectId: 'proj-1',
      projectName: '示例电商后端',
      status: 'completed',
      createdAt: now(),
      startedAt: now(),
      endedAt: now(),
    },
    {
      id: 'sess-2',
      taskId: 'task-2',
      taskName: '依赖项扫描',
      projectId: 'proj-2',
      projectName: '内部工具链',
      status: 'running',
      createdAt: now(),
      startedAt: now(),
    },
  ],
};

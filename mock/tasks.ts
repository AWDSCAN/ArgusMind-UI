import type { Request, Response } from 'express';
import {
  argusStore,
  type ScanType,
  type TaskRow,
  type TaskStatus,
} from './argusStore';

function paginate<T>(
  list: T[],
  current: number,
  pageSize: number,
  filter?: (row: T) => boolean,
) {
  const f = filter ? list.filter(filter) : list;
  const start = (current - 1) * pageSize;
  return {
    data: f.slice(start, start + pageSize),
    total: f.length,
    success: true,
  };
}

export default {
  'GET /api/tasks': (req: Request, res: Response) => {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const projectId = (req.query.projectId as string) || '';
    const status = (req.query.status as TaskStatus) || '';
    const creator = (req.query.creator as string) || '';
    const name = (req.query.name as string) || '';

    res.json(
      paginate(
        argusStore.tasks,
        current,
        pageSize,
        (t) =>
          (!projectId || t.projectId === projectId) &&
          (!status || t.status === status) &&
          (!creator || t.creator.includes(creator)) &&
          (!name || t.name.includes(name)),
      ),
    );
  },
  'GET /api/tasks/detail': (req: Request, res: Response) => {
    const id = req.query.id as string;
    const t = argusStore.tasks.find((x) => x.id === id);
    if (!t) {
      res.status(404).json({ success: false, errorMessage: '任务不存在' });
      return;
    }
    res.json({ success: true, data: t });
  },
  'POST /api/tasks': (req: Request, res: Response) => {
    const b = req.body as {
      name: string;
      projectId: string;
      projectName: string;
      scanType: ScanType;
      creator?: string;
    };
    const id = `task-${Date.now()}`;
    const sessionId = `sess-${Date.now()}`;
    const ts = new Date().toISOString();
    const task: TaskRow = {
      id,
      sessionId,
      name: b.name,
      projectId: b.projectId,
      projectName: b.projectName,
      scanType: b.scanType,
      status: 'pending',
      creator: b.creator || '当前用户',
      createdAt: ts,
    };
    argusStore.tasks.unshift(task);
    argusStore.sessions.unshift({
      id: sessionId,
      taskId: id,
      taskName: b.name,
      projectId: b.projectId,
      projectName: b.projectName,
      status: 'pending',
      createdAt: ts,
    });
    res.json({ success: true, data: task });
  },
};

import type { Request, Response } from 'express';
import { argusStore } from './argusStore';
import { buildAuditSessionDetail } from './auditSessionDetailBuilder';

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
  'GET /api/audit-sessions': (req: Request, res: Response) => {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const projectId = (req.query.projectId as string) || '';
    const status = (req.query.status as string) || '';
    const taskName = (req.query.taskName as string) || '';

    res.json(
      paginate(
        argusStore.sessions,
        current,
        pageSize,
        (s) =>
          (!projectId || s.projectId === projectId) &&
          (!status || s.status === status) &&
          (!taskName || s.taskName.includes(taskName)),
      ),
    );
  },
  'GET /api/audit-sessions/detail': (req: Request, res: Response) => {
    const id = (req.query.id as string) || '';
    const session = argusStore.sessions.find((s) => s.id === id);
    if (!session) {
      res.status(404).json({ success: false, message: '会话不存在' });
      return;
    }
    res.json({ success: true, data: buildAuditSessionDetail(session) });
  },
};

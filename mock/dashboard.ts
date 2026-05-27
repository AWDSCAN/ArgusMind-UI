import type { Request, Response } from 'express';

function last7DaysUtc(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const findingDaily = last7DaysUtc().map((date, i) => ({
  date,
  info: [4, 5, 4, 6, 5, 7, 6][i]!,
  low: [12, 14, 13, 16, 15, 17, 16][i]!,
  medium: [18, 20, 19, 22, 21, 24, 22][i]!,
  high: [14, 16, 15, 18, 17, 20, 18][i]!,
  critical: [4, 4, 4, 4, 4, 4, 5][i]!,
  unknown: 0,
}));

const tokenDaily = last7DaysUtc().map((date, i) => {
  const total = [8.2, 9.1, 9.6, 10.2, 10.8, 11.5, 12.3][i]! * 1_000_000;
  return {
    date,
    llm_input: Math.round(total * 0.35),
    llm_output: Math.round(total * 0.25),
    code_agent_input: Math.round(total * 0.22),
    code_agent_output: Math.round(total * 0.18),
    total,
  };
});

export default {
  'GET /api/tasks/stats': (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        total: 128,
        by_status: {
          pending: 8,
          running: 16,
          completed: 96,
          failed: 8,
          cancelled: 0,
        },
      },
    });
  },

  'GET /api/projects/overview': (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        total_projects: 23,
        total_files: 6183,
        total_lines: 2_400_000,
        languages: [
          { language: 'JavaScript', code: 3840, files: 120, lines: 4200 },
          { language: 'Java', code: 1280, files: 45, lines: 1500 },
          { language: 'Go', code: 696, files: 28, lines: 800 },
          { language: 'Python', code: 260, files: 12, lines: 300 },
          { language: '其他', code: 107, files: 5, lines: 120 },
        ],
        top_by_vulnerabilities: [
          {
            project_id: 'proj-1',
            project_name: 'eoffice',
            vulnerability_count: 29,
          },
          {
            project_id: 'proj-2',
            project_name: 'vue-admin',
            vulnerability_count: 18,
          },
          {
            project_id: 'proj-3',
            project_name: 'api-gateway',
            vulnerability_count: 15,
          },
          {
            project_id: 'proj-4',
            project_name: 'auth-service',
            vulnerability_count: 12,
          },
          {
            project_id: 'proj-5',
            project_name: 'legacy-crm',
            vulnerability_count: 9,
          },
        ],
      },
    });
  },

  'GET /api/findings/stats': (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        total: 89,
        by_severity: {
          critical: 5,
          high: 18,
          medium: 38,
          low: 22,
          info: 6,
          unknown: 0,
        },
      },
    });
  },

  'GET /api/findings/stats/by-type': (req: Request, res: Response) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 5));
    const all = [
      { category_name: 'sql_injection', count: 28 },
      { category_name: 'xss', count: 19 },
      { category_name: '信息泄露', count: 14 },
      { category_name: 'command_execution', count: 9 },
      { category_name: '未分类', count: 12 },
    ];
    res.json({ success: true, data: all.slice(0, limit) });
  },

  'GET /api/findings/stats/daily': (req: Request, res: Response) => {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    res.json({
      success: true,
      data: findingDaily.slice(-days),
    });
  },

  'GET /api/tokens/stats': (_req: Request, res: Response) => {
    const total = 12_340_000;
    res.json({
      success: true,
      data: {
        llm_input: Math.round(total * 0.35),
        llm_output: Math.round(total * 0.25),
        code_agent_input: Math.round(total * 0.22),
        code_agent_output: Math.round(total * 0.18),
        total,
      },
    });
  },

  'GET /api/tokens/trend': (req: Request, res: Response) => {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    res.json({
      success: true,
      data: tokenDaily.slice(-days),
    });
  },
};

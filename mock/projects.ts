import type { Request, Response } from 'express';

type ProjectListRow = {
  id: string;
  name: string;
  path: string;
  repo_path?: string;
  branch: string | null;
  source_type?: string;
  health_status?: string;
  language: Record<string, unknown> | null;
  vulnerability_count: number;
  high_risk_count?: number;
  file_count: number;
  line_count: number;
  last_scanned_at?: string | null;
};

const langEoffice = {
  total: { code: 6183, files: 21 },
  languages: {
    JSON: { code: 1261, files: 6, lines: 1261 },
    Markdown: { code: 0, files: 2, lines: 198 },
    JavaScript: { code: 4922, files: 13, lines: 5769 },
  },
};

const langVue = {
  total: { code: 3245, files: 18 },
  languages: {
    Vue: { code: 2110, files: 8, lines: 2800 },
    JavaScript: { code: 852, files: 6, lines: 1200 },
    JSON: { code: 283, files: 4, lines: 283 },
  },
};

export let projects: ProjectListRow[] = [
  {
    id: 'proj-1',
    name: 'eoffice',
    path: 'D:/tmp/project/eoffice-uuid',
    repo_path: 'D:\\eoffice10',
    branch: 'main',
    source_type: 'path',
    health_status: 'normal',
    language: langEoffice,
    vulnerability_count: 12,
    high_risk_count: 2,
    file_count: 21,
    line_count: 6183,
    last_scanned_at: '2026-05-08T14:16:54.000Z',
  },
  {
    id: 'proj-2',
    name: 'admin-dashboard',
    path: 'D:/tmp/project/admin-uuid',
    repo_path: 'git@gitlab.com:admin/dashboard.git',
    branch: 'master',
    source_type: 'git',
    health_status: 'normal',
    language: langVue,
    vulnerability_count: 8,
    high_risk_count: 1,
    file_count: 18,
    line_count: 3245,
    last_scanned_at: '2026-05-08T11:23:16.000Z',
  },
  {
    id: 'proj-3',
    name: 'user-service',
    path: 'D:/tmp/project/user-svc-uuid',
    repo_path: 'git@github.com:company/user-service.git',
    branch: 'develop',
    source_type: 'path',
    health_status: 'risk',
    language: {
      total: { code: 12842, files: 45 },
      languages: {
        Python: { code: 7721, files: 20, lines: 9000 },
        YAML: { code: 2115, files: 8, lines: 2115 },
        JavaScript: { code: 1806, files: 12, lines: 2200 },
        Go: { code: 800, files: 3, lines: 900 },
        JSON: { code: 400, files: 2, lines: 400 },
      },
    },
    vulnerability_count: 56,
    high_risk_count: 12,
    file_count: 45,
    line_count: 12842,
    last_scanned_at: '2026-05-07T18:42:11.000Z',
  },
  {
    id: 'proj-4',
    name: 'internal-tools',
    path: '/data/repos/internal-tools',
    repo_path: '/data/repos/internal-tools',
    branch: null,
    source_type: 'path',
    health_status: 'pending_scan',
    language: null,
    vulnerability_count: 0,
    high_risk_count: 0,
    file_count: 0,
    line_count: 0,
    last_scanned_at: null,
  },
];

function filterList(list: ProjectListRow[], req: Request) {
  const name = ((req.query.name as string) || (req.query.keyword as string) || '').trim();
  const sourceType = req.query.source_type as string;
  const healthStatus = req.query.health_status as string;

  return list.filter((p) => {
    if (name && !p.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (sourceType && p.source_type !== sourceType) return false;
    if (healthStatus && p.health_status !== healthStatus) return false;
    return true;
  });
}

function paginate<T>(list: T[], current: number, pageSize: number) {
  const start = (current - 1) * pageSize;
  return {
    data: list.slice(start, start + pageSize),
    total: list.length,
    success: true,
  };
}

function buildStats(list: ProjectListRow[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: list.length,
    normal: list.filter((p) => p.health_status === 'normal').length,
    risk: list.filter((p) => p.health_status === 'risk').length,
    pending_scan: list.filter((p) => p.health_status === 'pending_scan').length,
    scanned_today: list.filter((p) => p.last_scanned_at?.startsWith(today)).length,
    total_vulnerabilities: list.reduce((s, p) => s + p.vulnerability_count, 0),
  };
}

export default {
  'GET /api/projects/stats': (req: Request, res: Response) => {
    const filtered = filterList(projects, req);
    res.json({ success: true, data: buildStats(filtered) });
  },
  'GET /api/projects': (req: Request, res: Response) => {
    const current = Number(req.query.current) || 1;
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 20));
    const filtered = filterList(projects, req);
    res.json(paginate(filtered, current, pageSize));
  },
  'GET /api/projects/detail': (req: Request, res: Response) => {
    const id = req.query.id as string;
    const p = projects.find((x) => x.id === id);
    if (!p) {
      res.status(404).json({ success: false, errorMessage: '项目不存在' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: p.id,
        name: p.name,
        key: p.id,
        path: p.path,
        branch: p.branch,
        sourceType: p.source_type ?? 'path',
        importStatus: 'success',
        fileCount: p.file_count,
        lineCount: p.line_count,
      },
    });
  },
  'POST /api/projects': (req: Request, res: Response) => {
    const b = req.body as { name: string };
    const id = `proj-${Date.now()}`;
    const row: ProjectListRow = {
      id,
      name: b.name,
      path: `D:/tmp/project/${id}`,
      repo_path: `D:/tmp/project/${id}`,
      branch: null,
      source_type: 'path',
      health_status: 'pending_scan',
      language: null,
      vulnerability_count: 0,
      high_risk_count: 0,
      file_count: 0,
      line_count: 0,
      last_scanned_at: null,
    };
    projects = [row, ...projects];
    res.json({ success: true, data: { id: row.id, name: row.name } });
  },
};

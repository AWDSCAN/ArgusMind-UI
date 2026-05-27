import { DEMO_PROJECT_ID, DEMO_PROJECT_NAME } from '../constants';

/** 来自 GET /api/projects — claimflow-demo（与 claimflow测试2 关联） */
export const demoProject = {
  id: '756673a8-ad64-475e-84d1-8ffef7421931',
  name: 'claimflow-demo',
  path: 'C:\\Users\\ArgusMind\\AppData\\Local\\Temp\\ArgusMind\\project\\110ee6ad-ec3a-41f8-81fb-d6cd56d6cf6b',
  repo_path: 'D:\\code\\research\\vibe-coding\\claimflow',
  branch: null,
  source_type: 'path',
  health_status: 'pending_scan',
  language: {
    total: {
      code: 15022,
      files: 116,
    },
    languages: {
      CSS: {
        code: 131,
        files: 1,
        lines: 154,
      },
      SVG: {
        code: 1,
        files: 1,
        lines: 1,
      },
      HTML: {
        code: 11,
        files: 1,
        lines: 11,
      },
      JSON: {
        code: 4774,
        files: 3,
        lines: 4774,
      },
      Svelte: {
        code: 4855,
        files: 41,
        lines: 5209,
      },
      Markdown: {
        code: 0,
        files: 4,
        lines: 619,
      },
      JavaScript: {
        code: 7,
        files: 1,
        lines: 13,
      },
      'Plain Text': {
        code: 0,
        files: 1,
        lines: 3,
      },
      TypeScript: {
        code: 5243,
        files: 63,
        lines: 6056,
      },
    },
  },
  vulnerability_count: 11,
  high_risk_count: 10,
  file_count: 116,
  line_count: 15022,
  last_scanned_at: null,
} as const;

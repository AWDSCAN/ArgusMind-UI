import { DEMO_PROJECT_ID, DEMO_TASK_ID, DEMO_TASK_NAME } from '../constants';

/** 来自 GET /api/tasks/{id} — claimflow测试2 */
export const demoTask = {
  id: 'b8b07d32-d7d5-4efa-8695-60d7e1250ff1',
  project_id: '756673a8-ad64-475e-84d1-8ffef7421931',
  name: 'claimflow测试2',
  status: 'paused',
  todo: [],
  llm_input_token: 1322073,
  llm_output_token: 68570,
  code_agent_input_token: 41005,
  code_agent_output_token: 6055,
  error: '',
  created_at: '2026-05-21T15:28:59.750488',
  finished_at: null,
  updated_at: '2026-05-21T15:48:21.221519',
  vulnCount: 11,
} as const;

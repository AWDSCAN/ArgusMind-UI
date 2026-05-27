import type { Request, Response } from 'express';

/** 与 findings mock 中 vuln-1 的 neo4j_element_id 对齐 */
const MOCK_AR_ID = 'mock-neo4j-ar';
const MOCK_SINK_ID = 'mock-e-sink';
const MOCK_RC_ID = 'mock-e-rc';
const MOCK_LANG_ID = 'mock-e-lang';

const mockResultToLanguageGraph = {
  nodes: [
    {
      elementId: MOCK_AR_ID,
      labels: ['AnalysisResult'],
      props: {
        vul_name: 'SQL Injection (mock)',
        verdict: 'LIKELY_VULNERABLE',
        confidence: 'HIGH',
        verification_status: 'CONFIRMED',
        status: 'completed',
      },
    },
    {
      elementId: MOCK_SINK_ID,
      labels: ['SinkFlowNode'],
      props: {
        file: 'src/main/java/com/example/order/repo/OrderRepository.java',
        line: 142,
        function: 'buildQuery',
        status: 'completed',
      },
    },
    {
      elementId: MOCK_RC_ID,
      labels: ['RiskCategory'],
      props: { category_name: 'SQL Injection', task_id: 'task-1' },
    },
    {
      elementId: MOCK_LANG_ID,
      labels: ['Language'],
      props: { name: 'Java', level: 1 },
    },
  ],
  edges: [
    {
      elementId: 'rel-hr-1',
      type: 'HAS_RESULT',
      start: MOCK_SINK_ID,
      end: MOCK_AR_ID,
      props: {},
    },
    {
      elementId: 'rel-hs-1',
      type: 'HAS_SINK',
      start: MOCK_RC_ID,
      end: MOCK_SINK_ID,
      props: {},
    },
    {
      elementId: 'rel-hl-1',
      type: 'HAS_LANGUAGE',
      start: MOCK_LANG_ID,
      end: MOCK_RC_ID,
      props: {},
    },
  ],
  path: [MOCK_AR_ID, MOCK_SINK_ID, MOCK_RC_ID, MOCK_LANG_ID],
};

export default {
  'GET /api/graph/result-to-language': (req: Request, res: Response) => {
    const taskId = String(req.query.task_id || '');
    const resultNodeId = String(req.query.result_node_id || '');
    if (!taskId || !resultNodeId) {
      res.status(400).json({ success: false, message: '缺少 task_id 或 result_node_id' });
      return;
    }
    res.json({ success: true, data: mockResultToLanguageGraph });
  },
};

import type { Request, Response } from 'express';
import { vulnerabilities } from './vulnerabilities';

const sampleExploitationChain = {
  version: 1,
  analysis_result_node_id: 'mock-ar',
  task_id: 'task-1',
  project_root: '/tmp/mock',
  generated_at: new Date().toISOString(),
  error: null,
  paths: [
    {
      path_id: 'p0',
      steps: [
        {
          index: 0,
          node_kind: 'analysis_result',
          labels: ['AnalysisResult'],
          element_id: 'mock-e-ar',
          ids: { node_id: 'ar_mock' },
          properties: {
            verdict: 'LIKELY_VULNERABLE',
            vul_name: 'SQL Injection (mock chain)',
            confidence: 'HIGH',
            task_id: 'task-1',
          },
          location: null,
          source_context: null,
          audit_infos: [],
        },
        {
          index: 1,
          node_kind: 'sink_flow_node',
          labels: ['SinkFlowNode'],
          element_id: 'mock-e-sink',
          ids: { sink_node_id: 'repo/OrderRepository.java:142:buildQuery' },
          properties: {
            file: 'src/main/java/com/example/order/repo/OrderRepository.java',
            line: 142,
            function: 'buildQuery',
            reason:
              '用户可控 `rawId` 经字符串拼接进入 SQL，未使用预编译，存在注入面。',
            related_exec: '',
            related_exec_node: '',
          },
          location: {
            file: 'src/main/java/com/example/order/repo/OrderRepository.java',
            line: 142,
          },
          source_context: {
            relative_file:
              'src/main/java/com/example/order/repo/OrderRepository.java',
            focus_line: 142,
            start_line: 140,
            end_line: 144,
            lines: [
              { line_no: 140, text: '    }' },
              { line_no: 141, text: '' },
              {
                line_no: 142,
                text:
                  "    String sql = \"SELECT * FROM orders WHERE id = '\" + rawId + \"'\";",
              },
              { line_no: 143, text: '    return jdbc.query(sql);' },
              { line_no: 144, text: '  }' },
            ],
          },
          audit_infos: [],
        },
      ],
    },
  ],
};

function rowToFindingRead(row: (typeof vulnerabilities)[0]) {
  const isFirst = row.id === 'vuln-1';
  return {
    id: row.id,
    project_id: row.projectId,
    task_id: row.taskId,
    vul_name: row.title,
    category_name: row.cwe || '',
    level: row.severity,
    verdict: 'LIKELY_VULNERABLE',
    status: row.status,
    neo4j_element_id: isFirst ? 'mock-neo4j-ar' : '',
    confidence: 'HIGH',
    created_at: row.discoveredAt,
    updated_at: row.discoveredAt,
    detail: {
      evidence: isFirst ? 'Mock 证据：污点自 HTTP 参数进入 SQL 拼接。' : '',
      detail: row.description,
      entry_points: '',
      security_boundaries: '',
      analysis_rounds: 1,
      verification_status: '',
      verification_reason: isFirst
        ? '静态分析 + 链路确认通过（Mock）'
        : '',
      vulnerability_analysis_report: isFirst
        ? '## 执行摘要\n\n（Mock）存在 SQL 注入风险。\n\n## 细节\n\n建议使用预编译参数。'
        : '',
      poc: isFirst ? 'print("mock poc")\n' : '',
      exploitation_chain: isFirst ? sampleExploitationChain : null,
    },
  };
}

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
  'GET /api/findings': (req: Request, res: Response) => {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const severity = (req.query.severity as string) || '';
    const status = (req.query.status as string) || '';
    const projectId = (req.query.project_id as string) || '';
    const taskId = (req.query.task_id as string) || '';
    const keyword = (req.query.keyword as string) || '';

    const mapped = vulnerabilities.map(rowToFindingRead);
    const filtered = mapped.filter(
      (v) =>
        (!severity ||
          String(v.level).toLowerCase() === severity.toLowerCase()) &&
        (!status || String(v.status).toLowerCase() === status.toLowerCase()) &&
        (!projectId || v.project_id === projectId) &&
        (!taskId || v.task_id === taskId) &&
        (!keyword ||
          v.vul_name.includes(keyword) ||
          (v.detail?.detail && String(v.detail.detail).includes(keyword))),
    );
    const { data, total, success } = paginate(filtered, current, pageSize);
    res.json({ data, total, success });
  },
  'GET /api/findings/by-neo4j-element-id': (req: Request, res: Response) => {
    const neo4jElementId = String(req.query.neo4j_element_id || '').trim();
    if (!neo4jElementId) {
      res.status(400).json({ success: false, message: '缺少 neo4j_element_id' });
      return;
    }
    const mapped = vulnerabilities.map(rowToFindingRead);
    const finding = mapped.find((f) => f.neo4j_element_id === neo4jElementId);
    if (!finding) {
      res.status(404).json({ success: false, message: '未找到对应漏洞' });
      return;
    }
    res.json({ success: true, data: finding });
  },
  'GET /api/findings/:finding_id': (req: Request, res: Response) => {
    const id = req.params.finding_id || '';
    const row = vulnerabilities.find((v) => v.id === id);
    if (!row) {
      res.status(404).json({ success: false, message: '漏洞不存在' });
      return;
    }
    res.json({ success: true, data: rowToFindingRead(row) });
  },
};

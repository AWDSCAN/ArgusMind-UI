import type { Request, Response } from 'express';

export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type VulnStatus =
  | 'open'
  | 'confirmed'
  | 'false_positive'
  | 'fixed'
  | 'ignored';

export type VulnerabilityRow = {
  id: string;
  title: string;
  severity: VulnSeverity;
  status: VulnStatus;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  cwe?: string;
  filePath?: string;
  line?: number;
  description: string;
  discoveredAt: string;
  callChainText: string;
};

const now = () => new Date().toISOString();

const longChain =
  'Source: HTTP 参数 `orderId`（GET /api/orders/{id}）\n' +
  '  → com.example.order.web.OrderController#getDetail\n' +
  '  → com.example.order.service.OrderService#fetchOrder\n' +
  '  → com.example.order.repo.OrderRepository#buildQuery(String rawId)\n' +
  '  → java.sql.Statement#executeQuery(String sql)  [SINK]\n' +
  '\n' +
  '污点摘要：用户可控字符串经 `rawId` 拼入 SQL，未使用预编译。\n' +
  Array.from({ length: 12 }, (_, i) => `  [mock 路径行 ${i + 1}]`).join('\n');

export const vulnerabilities: VulnerabilityRow[] = [
  {
    id: 'vuln-1',
    title: 'OrderRepository 存在 SQL 拼接',
    severity: 'high',
    status: 'open',
    projectId: 'proj-1',
    projectName: '示例电商后端',
    taskId: 'task-1',
    taskName: '全量安全审计',
    cwe: 'CWE-89',
    filePath: 'src/main/java/com/example/order/repo/OrderRepository.java',
    line: 142,
    description:
      '用户输入经字符串拼接进入 executeQuery，存在 SQL 注入风险；建议改为 PreparedStatement。',
    discoveredAt: now(),
    callChainText: longChain,
  },
  {
    id: 'vuln-2',
    title: 'Payment 回调 URL 未校验协议与白名单',
    severity: 'medium',
    status: 'confirmed',
    projectId: 'proj-1',
    projectName: '示例电商后端',
    taskId: 'task-1',
    taskName: '全量安全审计',
    cwe: 'CWE-918',
    filePath: 'src/main/java/com/example/pay/PaymentCallbackServlet.java',
    line: 88,
    description: '回调地址可由配置侧覆盖，缺少对 http(s) 与域名的约束，存在 SSRF 面。',
    discoveredAt: now(),
    callChainText:
      'Config key `payment.callbackUrl` → PaymentCallbackServlet#doPost\n' +
      '  → HttpClient#get(url)  [SINK: 出站请求]\n',
  },
  {
    id: 'vuln-3',
    title: '依赖项存在已知高危 CVE（Mock）',
    severity: 'critical',
    status: 'open',
    projectId: 'proj-2',
    projectName: '内部工具链',
    taskId: 'task-2',
    taskName: '依赖项扫描',
    cwe: 'CWE-1104',
    filePath: 'package-lock.json',
    line: undefined,
    description: '锁定文件中某传递依赖命中 CVE-xxxx-xxxx（演示数据）。',
    discoveredAt: now(),
    callChainText:
      'SBOM 节点: lodash@4.17.20\n' +
      '  → 上游 advisory: CVE-xxxx-xxxx\n' +
      '  → 可达路径: cli → util → lodash (devDependency)\n',
  },
  {
    id: 'vuln-4',
    title: '日志中打印鉴权 Token 片段',
    severity: 'low',
    status: 'false_positive',
    projectId: 'proj-2',
    projectName: '内部工具链',
    taskId: 'task-2',
    taskName: '依赖项扫描',
    cwe: 'CWE-532',
    filePath: 'src/logger.ts',
    line: 34,
    description: '调试日志包含 Authorization 前 8 字符；已判定为测试环境专用，业务侧可忽略。',
    discoveredAt: now(),
    callChainText:
      'middleware/auth.ts → logger.debug(`Bearer ${token.slice(0,8)}...`)\n',
  },
  {
    id: 'vuln-5',
    title: '反序列化入口需加固',
    severity: 'high',
    status: 'fixed',
    projectId: 'proj-1',
    projectName: '示例电商后端',
    taskId: 'task-1',
    taskName: '全量安全审计',
    cwe: 'CWE-502',
    filePath: 'src/main/java/com/example/admin/ConfigImportController.java',
    line: 56,
    description: '已切换为 JSON Schema 校验 + 类型白名单（Mock 状态：已修复）。',
    discoveredAt: now(),
    callChainText:
      'Multipart 上传 → ConfigImportController#importYaml\n' +
      '  → YamlBeanFactory (historical)\n' +
      '  → [已移除] 任意类反序列化\n',
  },
];

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
  'GET /api/vulnerabilities': (req: Request, res: Response) => {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const severity = (req.query.severity as string) || '';
    const status = (req.query.status as string) || '';
    const projectId = (req.query.projectId as string) || '';
    const taskId = (req.query.taskId as string) || '';
    const title = (req.query.title as string) || '';

    const filtered = vulnerabilities.filter(
      (v) =>
        (!severity || v.severity === severity) &&
        (!status || v.status === status) &&
        (!projectId || v.projectId === projectId) &&
        (!taskId || v.taskId === taskId) &&
        (!title || v.title.includes(title)),
    );
    const { data, total, success } = paginate(
      filtered,
      current,
      pageSize,
    );
    res.json({
      data: data.map(
        ({
          id,
          title: t,
          severity: sev,
          status: st,
          projectId: pid,
          projectName,
          taskId: tid,
          taskName,
          cwe,
          filePath,
          line,
          description,
          discoveredAt,
        }) => ({
          id,
          title: t,
          severity: sev,
          status: st,
          projectId: pid,
          projectName,
          taskId: tid,
          taskName,
          cwe,
          filePath,
          line,
          description,
          discoveredAt,
        }),
      ),
      total,
      success,
    });
  },
  'GET /api/vulnerabilities/detail': (req: Request, res: Response) => {
    const id = (req.query.id as string) || '';
    const row = vulnerabilities.find((v) => v.id === id);
    if (!row) {
      res.status(404).json({ success: false, message: '漏洞不存在' });
      return;
    }
    res.json({ success: true, data: row });
  },
  'DELETE /api/findings/vulnerabilities/:finding_id': (req: Request, res: Response) => {
    const id = req.params.finding_id || '';
    const index = vulnerabilities.findIndex((v) => v.id === id);
    if (index < 0) {
      res.status(404).json({ success: false, message: '漏洞不存在' });
      return;
    }
    vulnerabilities.splice(index, 1);
    res.json({ success: true });
  },
};

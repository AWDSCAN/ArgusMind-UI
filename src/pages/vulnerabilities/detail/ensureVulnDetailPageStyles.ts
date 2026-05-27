import { ensureTaskDetailPageStylesMounted } from '@/pages/tasks/detail/ensureTaskDetailPageStyles';
import { vulnDetailReportScrollbarCss } from './detailStyles';

/** 注入漏洞详情页依赖的全局样式（幂等） */
export function ensureVulnDetailPageStylesMounted(): void {
  ensureTaskDetailPageStylesMounted();

  if (typeof document === 'undefined') return;

  if (!document.getElementById('vuln-detail-report-scrollbar-styles')) {
    const style = document.createElement('style');
    style.id = 'vuln-detail-report-scrollbar-styles';
    style.innerHTML = vulnDetailReportScrollbarCss;
    document.head.appendChild(style);
  }
}

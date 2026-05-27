/** 与任务详情共用列高，保证审计图画布可视区域一致 */
export {
  TASK_DETAIL_AUDIT_CHAIN_TRAY_CLASS,
  TASK_DETAIL_AUDIT_CHAIN_TRAY_PADDING,
  TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
  TASK_DETAIL_MODULE_TABS_CLASS,
  taskDetailTabsLayoutCss,
} from '@/pages/tasks/detail/detailStyles';

export const VULN_DETAIL_REPORT_SCROLL_CLASS = 'vuln-detail-report-scroll';

export const vulnDetailReportScrollbarCss = `
.${VULN_DETAIL_REPORT_SCROLL_CLASS} {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.28) rgba(0, 0, 0, 0.04);
}
.${VULN_DETAIL_REPORT_SCROLL_CLASS}::-webkit-scrollbar {
  width: 8px;
}
.${VULN_DETAIL_REPORT_SCROLL_CLASS}::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 8px;
}
`;

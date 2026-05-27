import {
  pulseKeyframes,
  taskDetailAuditChainTrayFullscreenCss,
  taskDetailTabsLayoutCss,
  taskEventsScrollbarCss,
} from './detailStyles';

/** 在 document 上注入任务详情页依赖的全局样式（幂等） */
export function ensureTaskDetailPageStylesMounted(): void {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('event-step-pulse-keyframes')) {
    const style = document.createElement('style');
    style.id = 'event-step-pulse-keyframes';
    style.innerHTML = pulseKeyframes;
    document.head.appendChild(style);
  }
  if (!document.getElementById('task-events-scrollbar-styles')) {
    const style = document.createElement('style');
    style.id = 'task-events-scrollbar-styles';
    style.innerHTML = taskEventsScrollbarCss;
    document.head.appendChild(style);
  }
  if (!document.getElementById('task-detail-tabs-layout-styles')) {
    const style = document.createElement('style');
    style.id = 'task-detail-tabs-layout-styles';
    style.innerHTML = taskDetailTabsLayoutCss;
    document.head.appendChild(style);
  }
  if (
    !document.getElementById('task-detail-audit-chain-tray-fullscreen-styles')
  ) {
    const style = document.createElement('style');
    style.id = 'task-detail-audit-chain-tray-fullscreen-styles';
    style.innerHTML = taskDetailAuditChainTrayFullscreenCss;
    document.head.appendChild(style);
  }
}

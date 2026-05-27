import type { CSSProperties } from 'react';

export const TABLE_SCROLL_Y = 280;

export const toolDetailCodeBlockStyle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  padding: 12,
  borderRadius: 8,
  background: '#141414',
  border: '1px solid #303030',
  color: '#f5f5f5',
  whiteSpace: 'pre-wrap',
  fontFamily:
    'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
  fontSize: 12,
  lineHeight: 1.6,
  overflowX: 'auto',
};

export const tabPaneScroll: CSSProperties = {
  maxHeight: 'min(640px, calc(100vh - 260px))',
  overflowY: 'auto',
  paddingRight: 4,
  paddingTop: 4,
};

/** 事件列表滚动容器 class（与底部注入的滚动条样式配套） */
export const TASK_EVENTS_SCROLL_CLASS = 'task-events-scrollbar';
/** 事件行：离屏跳过绘制，保留真实 DOM 高度（滚动条稳定） */
export const TASK_EVENT_TIMELINE_ROW_CLASS = 'task-event-timeline-row';
/** OpenCode 抽屉 / 推理块等滚动区域（与底部注入的滚动条样式配套） */
export const OPENCODE_SCROLL_CLASS = 'opencode-scrollbar';
/** OpenCode 执行流滚动区底部与视口底边的留白（px） */
export const OPENCODE_STREAM_VIEWPORT_BOTTOM_GAP = 24;
/** 执行流区域最小高度（px） */
export const OPENCODE_STREAM_MIN_HEIGHT = 220;

/** 事件：外层大卡片内滚动区域高度（保持原 AI 对话视觉） */
export const dialogueCardBodyScroll: CSSProperties = {
  maxHeight: 'min(calc(100vh - 132px), 920px)',
  overflowY: 'auto',
  padding: 16,
};

/** 任务详情左右分栏统一高度（与 PageContainer 页眉等区域留白一致） */
export const TASK_DETAIL_MAIN_COLUMNS_HEIGHT = 'calc(100vh - 120px)';

/** 审计链路：①灰托盘 ↔ ②白 Card */
export const TASK_DETAIL_AUDIT_CHAIN_TRAY_PADDING = '8px 8px';

/** 审计链路托盘根节点（浏览器全屏目标） */
export const TASK_DETAIL_AUDIT_CHAIN_TRAY_CLASS =
  'task-detail-audit-chain-tray';

export const taskDetailAuditChainTrayFullscreenCss = `
.${TASK_DETAIL_AUDIT_CHAIN_TRAY_CLASS}:fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  box-sizing: border-box;
  padding: 12px;
  background: var(--ant-color-fill-quaternary);
}
`;

/** 任务详情左侧 Tabs 根节点 class（与 taskDetailTabsLayoutCss 配套） */
export const TASK_DETAIL_MODULE_TABS_CLASS = 'task-detail-module-tabs';

/** 事件 Tab：上时间线滚动 + 底栏固定；高度由父级 flex 链约束，不用独立 maxHeight 以免被裁切 */
export const eventTabCardBodyLayout: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: 0,
};

/** 左侧模块 Tabs 填满列高，内容区可 flex 分配高度 */
export const taskDetailTabsLayoutCss = `
.${TASK_DETAIL_MODULE_TABS_CLASS} {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${TASK_DETAIL_MODULE_TABS_CLASS} > .ant-tabs-nav {
  flex-shrink: 0;
}
.${TASK_DETAIL_MODULE_TABS_CLASS} > .ant-tabs-content-holder {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.${TASK_DETAIL_MODULE_TABS_CLASS} .ant-tabs-content,
.${TASK_DETAIL_MODULE_TABS_CLASS} .ant-tabs-content-top {
  height: 100%;
}
.${TASK_DETAIL_MODULE_TABS_CLASS} .ant-tabs-tabpane {
  height: 100%;
  overflow: hidden;
}
`;

/** 事件时间线可滚动内层 */
export const eventTimelineScrollArea: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: 16,
};

export const taskEventsScrollbarCss = `
.${TASK_EVENTS_SCROLL_CLASS} {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.28) rgba(0, 0, 0, 0.04);
  overflow-anchor: none;
}
.${TASK_EVENT_TIMELINE_ROW_CLASS} {
  content-visibility: auto;
  contain-intrinsic-size: auto 148px;
}
.${TASK_EVENTS_SCROLL_CLASS}::-webkit-scrollbar {
  width: 8px;
}
.${TASK_EVENTS_SCROLL_CLASS}::-webkit-scrollbar-track {
  margin: 4px 0;
  background: transparent;
  border-radius: 8px;
}
.${TASK_EVENTS_SCROLL_CLASS}::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.22),
    rgba(0, 0, 0, 0.14)
  );
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.${TASK_EVENTS_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.38),
    rgba(0, 0, 0, 0.22)
  );
  border: 2px solid transparent;
  background-clip: padding-box;
}

.${OPENCODE_SCROLL_CLASS} {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.38) rgba(0, 0, 0, 0.06);
}
.${OPENCODE_SCROLL_CLASS}::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.${OPENCODE_SCROLL_CLASS}::-webkit-scrollbar-track {
  margin: 6px 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.02),
    rgba(0, 0, 0, 0.06) 50%,
    rgba(0, 0, 0, 0.02)
  );
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.${OPENCODE_SCROLL_CLASS}::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.34),
    rgba(0, 0, 0, 0.18)
  );
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background-clip: padding-box;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.${OPENCODE_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.48),
    rgba(0, 0, 0, 0.28)
  );
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.${OPENCODE_SCROLL_CLASS}::-webkit-scrollbar-thumb:active {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.58),
    rgba(0, 0, 0, 0.36)
  );
}
`;

export const pulseKeyframes = `
@keyframes eventPulseProcessing {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.14); opacity: 0.8; }
}
@keyframes eventPulseSuccess {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.84; }
}
@keyframes eventPulseError {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.16); opacity: 0.78; }
}
@keyframes eventPulseWarning {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.14); opacity: 0.82; }
}
`;

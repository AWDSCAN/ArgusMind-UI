import type { CSSProperties } from 'react';

export const chartCardBody: CSSProperties = {
  height: 260,
};

export const chartCardBodySm: CSSProperties = {
  height: 220,
};

export const heroWrap: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 18,
};

export const heroTitle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.35,
};

export const heroSubtitle: CSSProperties = {
  margin: '8px 0 0',
  color: 'var(--ant-color-text-secondary)',
  fontSize: 14,
};

export const statusPill: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  marginLeft: 10,
  padding: '4px 10px',
  borderRadius: 999,
  background: 'var(--dashboard-status-bg, #e9f8f0)',
  color: 'var(--dashboard-status-fg, #12a150)',
  fontSize: 13,
  fontWeight: 500,
  verticalAlign: 'middle',
};

export const miniStatCard: CSSProperties = {
  height: 38,
  minWidth: 128,
  padding: '0 14px',
  border: '1px solid var(--ant-color-border-secondary)',
  borderRadius: 8,
  background: 'var(--ant-color-bg-container)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 13,
  color: 'var(--ant-color-text-secondary)',
  boxShadow: '0 6px 18px rgba(31, 42, 68, 0.04)',
};

export const rankRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(72px, 1fr) 1fr 32px',
  gap: 12,
  alignItems: 'center',
  marginBottom: 14,
  fontSize: 13,
  color: 'var(--ant-color-text)',
};

export const rankBarBg: CSSProperties = {
  height: 7,
  background: 'var(--ant-color-fill-quaternary)',
  borderRadius: 999,
  overflow: 'hidden',
};

export const chartsRow3: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 16,
  marginBottom: 16,
};

export const chartsRowBottom: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  marginBottom: 16,
};

export const pieCenterOverlay: CSSProperties = {
  position: 'absolute',
  left: '34%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  pointerEvents: 'none',
};

export type KpiTheme = {
  main: string;
  soft: string;
  shadow: string;
};

export const KPI_THEMES: Record<string, KpiTheme> = {
  tasksTotal: {
    main: '#1677ff',
    soft: '#eaf3ff',
    shadow: 'rgba(22, 119, 255, 0.22)',
  },
  tasksRunning: {
    main: '#22c55e',
    soft: '#e9f8f0',
    shadow: 'rgba(34, 197, 94, 0.22)',
  },
  projectCount: {
    main: '#f59e0b',
    soft: '#fff7e6',
    shadow: 'rgba(245, 158, 11, 0.22)',
  },
  vulnTotal: {
    main: '#fa8c16',
    soft: '#fff4e6',
    shadow: 'rgba(250, 140, 22, 0.22)',
  },
  vulnHigh: {
    main: '#ef4444',
    soft: '#fff0f1',
    shadow: 'rgba(239, 68, 68, 0.22)',
  },
  tokenUsed: {
    main: '#7c3aed',
    soft: '#f2edff',
    shadow: 'rgba(124, 58, 237, 0.22)',
  },
};

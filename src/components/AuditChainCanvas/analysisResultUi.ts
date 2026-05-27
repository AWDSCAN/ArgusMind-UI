import type { CSSProperties } from 'react';

export type AnalysisResultPill = {
  key: string;
  label: string;
  bg: string;
  color: string;
  border?: string;
};

export type AnalysisResultUi = {
  /** 等级 / SAFE 强调色（MiniMap、内描边） */
  levelBar: string;
  iconBg: string;
  iconColor: string;
  pills: AnalysisResultPill[];
  /** verdict === SAFE：不用 level 配色，连线用安全色 */
  isSafeVerdict: boolean;
};

const SAFE_VERDICT_THEME = {
  bar: '#10b981',
  iconBg: '#ecfdf5',
  iconColor: '#047857',
} as const;

/** 与 SAFE 分析结果相连的边描边 / 箭头色 */
export const ANALYSIS_SAFE_EDGE_COLOR = SAFE_VERDICT_THEME.bar;

export function isAnalysisSafeVerdict(raw: Record<string, unknown>): boolean {
  return norm(raw.verdict) === 'SAFE';
}

function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toUpperCase();
}

function verdictPill(v: string): AnalysisResultPill {
  switch (v) {
    case 'LIKELY_VULNERABLE':
      return {
        key: 'verdict',
        label: '存在漏洞',
        bg: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
      };
    case 'POSSIBLY_VULNERABLE':
      return {
        key: 'verdict',
        label: '疑似漏洞',
        bg: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fde68a',
      };
    case 'SAFE':
      return {
        key: 'verdict',
        label: '安全',
        bg: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0',
      };
    default:
      return {
        key: 'verdict',
        label: v || '判定',
        bg: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0',
      };
  }
}

function confidencePill(c: string): AnalysisResultPill {
  switch (c) {
    case 'HIGH':
      return {
        key: 'confidence',
        label: '置信·高',
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
      };
    case 'MEDIUM':
      return {
        key: 'confidence',
        label: '置信·中',
        bg: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fde68a',
      };
    case 'LOW':
      return {
        key: 'confidence',
        label: '置信·低',
        bg: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
      };
    default:
      return {
        key: 'confidence',
        label: c ? `置信·${c}` : '置信度',
        bg: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
      };
  }
}

function verificationPill(s: string): AnalysisResultPill {
  switch (s) {
    case 'CONFIRMED':
      return {
        key: 'verification',
        label: '已确认',
        bg: '#ecfdf5',
        color: '#047857',
        border: '1px solid #6ee7b7',
      };
    case 'REJECTED':
      return {
        key: 'verification',
        label: '已驳回',
        bg: '#f1f5f9',
        color: '#475569',
        border: '1px solid #cbd5e1',
      };
    default:
      return {
        key: 'verification',
        label: s || '核验',
        bg: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
      };
  }
}

/** 漏洞等级：条形色 + 图标区配色 */
function levelTheme(level: string): {
  bar: string;
  iconBg: string;
  iconColor: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        bar: '#7f1d1d',
        iconBg: '#fef2f2',
        iconColor: '#991b1b',
      };
    case 'HIGH':
      return {
        bar: '#dc2626',
        iconBg: '#fff1f2',
        iconColor: '#e11d48',
      };
    case 'MEDIUM':
      return {
        bar: '#ea580c',
        iconBg: '#fff7ed',
        iconColor: '#c2410c',
      };
    case 'LOW':
      return {
        bar: '#2563eb',
        iconBg: '#eff6ff',
        iconColor: '#1d4ed8',
      };
    case 'INFO':
      return {
        bar: '#64748b',
        iconBg: '#f8fafc',
        iconColor: '#475569',
      };
    default:
      return {
        bar: '#94a3b8',
        iconBg: '#fff1f2',
        iconColor: '#e11d48',
      };
  }
}

function levelPill(level: string): AnalysisResultPill {
  const t = levelTheme(level);
  const labelMap: Record<string, string> = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFO: 'INFO',
  };
  return {
    key: 'level',
    label: labelMap[level] ?? (level || '等级'),
    bg: t.iconBg,
    color: t.iconColor,
    border: '1px solid #e2e8f0',
  };
}

/**
 * 根据 Neo4j / 后端 `AnalysisResult` 的 props 生成节点内展示用样式与标签。
 */
export function resolveAnalysisResultUi(
  raw: Record<string, unknown>,
): AnalysisResultUi {
  const verdict = norm(raw.verdict);
  const confidence = norm(raw.confidence);
  const verification = norm(raw.verification_status);
  const level = norm(raw.level);
  const isSafeVerdict = verdict === 'SAFE';

  const lt = levelTheme(level);
  const vp = verdictPill(verdict);

  const pills: AnalysisResultPill[] = [];
  pills.push(vp);
  if (confidence) pills.push(confidencePill(confidence));
  if (verification) pills.push(verificationPill(verification));
  if (level && !isSafeVerdict) pills.push(levelPill(level));

  const iconBg = isSafeVerdict ? SAFE_VERDICT_THEME.iconBg : lt.iconBg;
  const iconColor = isSafeVerdict ? SAFE_VERDICT_THEME.iconColor : lt.iconColor;
  const levelBar = isSafeVerdict ? SAFE_VERDICT_THEME.bar : lt.bar;

  return {
    levelBar,
    iconBg,
    iconColor,
    pills,
    isSafeVerdict,
  };
}

export function analysisResultPillStyle(p: AnalysisResultPill): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.02,
    background: p.bg,
    color: p.color,
    border: p.border,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

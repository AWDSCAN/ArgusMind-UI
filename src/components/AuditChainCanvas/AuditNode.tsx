import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import React, { memo, useMemo } from 'react';
import {
  analysisResultPillStyle,
  resolveAnalysisResultUi,
} from './analysisResultUi';
import {
  FALLBACK_STYLE,
  NODE_STYLE,
  type RunStatus,
  STATUS_STYLE,
} from './constants';
import type { AuditFlowNode } from './types';

const baseCardStyle: React.CSSProperties = {
  position: 'relative',
  width: 240,
  borderRadius: 16,
  border: '2px solid transparent',
  background: '#ffffff',
  padding: 1,
  transition:
    'box-shadow 200ms ease, border-color 200ms ease, opacity 200ms ease',
};

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: '#ffffff',
  border: '2px solid #98a2b3',
  borderRadius: 9999,
  opacity: 0,
  transition: 'opacity 0.15s ease',
};

const innerStyle: React.CSSProperties = {
  borderRadius: 14,
  background: '#ffffff',
  boxShadow:
    '0 1px 2px 0 rgba(20, 27, 36, 0.06), 0 1px 3px 0 rgba(20, 27, 36, 0.10)',
};

function pickBorder(opts: {
  isRoot: boolean;
  isInChain: boolean;
  status?: string;
}): { color: string; shadow?: string } {
  const { isRoot, isInChain, status } = opts;
  if (isRoot) {
    return {
      color: '#1d4ed8',
      shadow:
        '0 4px 12px 0 rgba(20, 27, 36, 0.12), 0 2px 4px 0 rgba(20, 27, 36, 0.08)',
    };
  }
  if (isInChain) return { color: '#93c5fd' };
  if (status === 'running') return { color: '#60a5fa' };
  if (status === 'completed') return { color: '#6ee7b7' };
  if (status === 'failed') return { color: '#f87171' };
  return { color: 'transparent' };
}

function AuditNode({ data, selected }: NodeProps<AuditFlowNode>) {
  const style = NODE_STYLE[data.label] ?? FALLBACK_STYLE;
  const { Icon } = style;
  const status = data.status ? STATUS_STYLE[data.status] : null;
  const isInChain = Boolean(data.highlighted);
  const isRoot = Boolean(selected);
  const isDimmed = Boolean(data.dimmed);
  const isAnalysis = data.label === 'AnalysisResult';
  const isAuditStage = data.label === 'AuditStage';
  const stageStatus = data.status as RunStatus | undefined;
  const raw = (data.raw ?? {}) as Record<string, unknown>;
  const arVerdict = String(raw.verdict ?? '');
  const arConfidence = String(raw.confidence ?? '');
  const arVerification = String(raw.verification_status ?? '');
  const arLevel = String(raw.level ?? '');
  const arUi = useMemo(
    () => (isAnalysis ? resolveAnalysisResultUi(raw) : null),
    [isAnalysis, arVerdict, arConfidence, arVerification, arLevel],
  );

  const stageUi = useMemo(() => {
    if (!isAuditStage) return null;
    const s = stageStatus ?? 'pending';
    switch (s) {
      case 'running':
        return { bg: '#eff6ff', color: '#2563eb' };
      case 'completed':
        return { bg: '#ecfdf5', color: '#059669' };
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626' };
      default:
        return { bg: '#f8fafc', color: '#64748b' };
    }
  }, [isAuditStage, stageStatus]);

  const iconBg =
    isAnalysis && arUi
      ? arUi.iconBg
      : isAuditStage && stageUi
        ? stageUi.bg
        : style.iconBg;
  const iconColor =
    isAnalysis && arUi
      ? arUi.iconColor
      : isAuditStage && stageUi
        ? stageUi.color
        : style.iconColor;

  const iconEl = useMemo(() => {
    const sz = { fontSize: 16, color: iconColor } as React.CSSProperties;
    if (isAnalysis && arUi?.isSafeVerdict) {
      return <CheckCircleFilled style={sz} />;
    }
    if (isAuditStage) {
      const s = stageStatus ?? 'pending';
      if (s === 'running') {
        return <LoadingOutlined style={sz} spin />;
      }
      if (s === 'completed') {
        return <CheckCircleFilled style={sz} />;
      }
      if (s === 'failed') {
        return <CloseCircleFilled style={sz} />;
      }
      return <ClockCircleOutlined style={sz} />;
    }
    return <Icon style={sz} />;
  }, [
    Icon,
    arUi?.isSafeVerdict,
    iconColor,
    isAnalysis,
    isAuditStage,
    stageStatus,
  ]);

  const border = pickBorder({
    isRoot,
    isInChain,
    status: data.status,
  });

  const innerMerged: React.CSSProperties =
    isAnalysis && arUi
      ? {
          ...innerStyle,
          /** 沿内层圆角全周包一圈等级色（不压标题顶边） */
          boxShadow: `${innerStyle.boxShadow as string}, inset 0 0 0 2px ${arUi.levelBar}`,
        }
      : innerStyle;

  return (
    <div
      className="audit-chain-node-card"
      style={{
        ...baseCardStyle,
        borderColor: border.color,
        boxShadow: border.shadow,
        opacity: isDimmed ? 0.22 : 1,
        outline: isRoot ? '4px solid rgba(147, 197, 253, 0.55)' : 'none',
        outlineOffset: isRoot ? -2 : 0,
        cursor: isDimmed ? 'default' : 'grab',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...handleStyle, left: -1, top: 24 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...handleStyle, right: -1, top: 24 }}
      />

      <div style={innerMerged}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 12px 8px',
          }}
        >
          <div
            style={{
              flex: '0 0 auto',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: iconBg,
            }}
          >
            {iconEl}
          </div>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div
              title={data.title}
              style={{
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {data.title}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 11,
                fontWeight: 500,
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {style.label}
            </div>
          </div>
          {status && (
            <div
              title={status.label}
              style={{
                flex: '0 0 auto',
                height: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '0 6px',
                borderRadius: 9999,
                boxShadow: `inset 0 0 0 1px ${status.ring}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 9999,
                  background: status.dot,
                  animation: status.animated
                    ? 'auditChainPulse 1.4s ease-in-out infinite'
                    : undefined,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: status.text,
                }}
              >
                {status.label}
              </span>
            </div>
          )}
        </div>

        {isAnalysis && arUi ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              padding: '0 12px 10px',
            }}
          >
            {arUi.pills.map((p) => (
              <span
                key={`${p.key}-${p.label}`}
                style={analysisResultPillStyle(p)}
              >
                {p.label}
              </span>
            ))}
          </div>
        ) : null}

        {data.subtitle ? (
          <div
            style={{
              margin: '0 12px 12px',
              padding: '6px 8px',
              borderRadius: 8,
              background: '#f8fafc',
            }}
          >
            <div
              title={data.subtitle}
              style={{
                fontSize: 11,
                lineHeight: 1.5,
                color: '#475569',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {data.subtitle}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(AuditNode);

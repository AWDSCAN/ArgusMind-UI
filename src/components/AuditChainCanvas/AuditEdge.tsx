import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  MarkerType,
} from '@xyflow/react';
import React, { memo } from 'react';
import { EDGE_COLOR, EDGE_LABEL } from './constants';
import type { AuditFlowEdge } from './types';

function AuditEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<AuditFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const kind = data?.kind ?? 'FLOW';
  const color =
    (data?.strokeOverride as string | undefined) ??
    (EDGE_COLOR as Record<string, string>)[kind] ??
    '#94a3b8';
  const label = (EDGE_LABEL as Record<string, string>)[kind] ?? String(kind);
  const highlighted = Boolean(selected || data?.highlighted);
  const dimmed = Boolean(data?.dimmed);

  const baseOpacity = kind === 'FLOW' ? 0.55 : 1;
  const opacity = highlighted ? 1 : dimmed ? 0.08 : baseOpacity;
  const strokeWidth = highlighted ? 2.5 : 1.5;
  const stroke = dimmed ? '#cbd5e1' : color;
  const showLabel = kind !== 'FLOW' && !dimmed;
  const markerColor = highlighted ? color : dimmed ? '#cbd5e1' : color;

  return (
    <>
      {highlighted ? (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.15}
          pointerEvents="none"
        />
      ) : null}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={{
          type: MarkerType.ArrowClosed,
          color: markerColor,
          width: 14,
          height: 14,
        }}
        style={{
          stroke,
          strokeWidth,
          opacity,
        }}
        className="audit-chain-edge-path"
      />
      {showLabel ? (
        <EdgeLabelRenderer>
          <div
            className="audit-chain-edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              padding: '1px 8px',
              borderRadius: 9999,
              border: `1px solid ${color}`,
              background: '#ffffff',
              color,
              fontSize: 10,
              fontWeight: highlighted ? 700 : 500,
              lineHeight: 1.5,
              boxShadow: highlighted ? `0 0 0 3px ${color}1a` : undefined,
              pointerEvents: 'all',
              userSelect: 'none',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(AuditEdge);

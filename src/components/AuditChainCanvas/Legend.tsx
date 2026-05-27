import { AppstoreOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import React from 'react';
import type { AuditChainNodeLabel } from '@/types/auditSessionDetail';
import { EDGE_COLOR, EDGE_LABEL, NODE_STYLE } from './constants';

const Legend: React.FC = () => {
  const labels = (Object.keys(NODE_STYLE) as AuditChainNodeLabel[]).filter(
    (l) => l !== 'AuditInfo',
  );
  const edgeKinds = Object.keys(EDGE_LABEL) as (keyof typeof EDGE_LABEL)[];

  const legendContent = (
    <div
      style={{
        maxWidth: 340,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          节点类型
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 12,
            rowGap: 4,
          }}
        >
          {labels.map((l) => {
            const s = NODE_STYLE[l];
            const Icon = s.Icon;
            return (
              <div
                key={l}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    background: s.iconBg,
                  }}
                >
                  <Icon style={{ color: s.iconColor, fontSize: 10 }} />
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          关系类型
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 8,
            rowGap: 4,
          }}
        >
          {edgeKinds.map((k) => (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: 2,
                  width: 14,
                  borderRadius: 2,
                  background: EDGE_COLOR[k],
                }}
              />
              <span style={{ fontSize: 11, color: '#475569' }}>
                {EDGE_LABEL[k]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <Popover
        trigger="click"
        placement="topLeft"
        content={legendContent}
        styles={{ body: { padding: 12 } }}
      >
        <Button
          type="default"
          size="small"
          icon={<AppstoreOutlined />}
          aria-label="图例"
          title="图例"
          style={{
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow:
              '0 1px 2px 0 rgba(20, 27, 36, 0.06), 0 1px 3px 0 rgba(20, 27, 36, 0.10)',
          }}
        />
      </Popover>
    </div>
  );
};

export default Legend;

import {
  AppstoreOutlined,
  BugOutlined,
  FundOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Col, Row, Tooltip, Typography } from 'antd';
import React from 'react';
import type { DashboardKpiCard } from '@/services/dashboard';
import { formatTokenCount } from '@/utils/formatTokenCount';
import { KPI_THEMES } from './dashboardStyles';
import { formatKpiValue } from './formatDashboard';

const kpiIcons: Record<string, React.ReactNode> = {
  tasksTotal: <FundOutlined />,
  tasksRunning: <PlayCircleOutlined />,
  projectCount: <AppstoreOutlined />,
  vulnTotal: <BugOutlined />,
  vulnHigh: <ThunderboltOutlined />,
  tokenUsed: <LineChartOutlined />,
};

const DISPLAY_KEYS = [
  'tasksTotal',
  'tasksRunning',
  'projectCount',
  'vulnTotal',
  'vulnHigh',
  'tokenUsed',
] as const;

function TokenBreakdownTooltip({
  breakdown,
}: {
  breakdown: NonNullable<DashboardKpiCard['tokenBreakdown']>;
}) {
  const rows = [
    { label: 'LLM 输入', value: breakdown.llmInput },
    { label: 'LLM 输出', value: breakdown.llmOutput },
    { label: 'Code Agent 输入', value: breakdown.codeAgentInput },
    { label: 'Code Agent 输出', value: breakdown.codeAgentOutput },
  ];
  return (
    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
      {rows.map((row) => (
        <div key={row.label}>
          {row.label}：{formatTokenCount(row.value)}
        </div>
      ))}
    </div>
  );
}

export type KpiCardsProps = {
  cards: DashboardKpiCard[];
};

export const KpiCards: React.FC<KpiCardsProps> = ({ cards }) => {
  const ordered = DISPLAY_KEYS.map((key) =>
    cards.find((c) => c.key === key),
  ).filter((c): c is DashboardKpiCard => c != null);

  return (
    <Row gutter={[14, 14]} style={{ marginBottom: 16 }}>
      {ordered.map((card) => {
        const theme = KPI_THEMES[card.key] ?? KPI_THEMES.tasksTotal;
        const icon = kpiIcons[card.key] ?? <FundOutlined />;
        const valueText = formatKpiValue(card.value, card.valueType);

        const valueNode = (
          <Typography.Title
            level={3}
            style={{
              margin: '4px 0 0',
              fontSize: 25,
              fontWeight: 700,
              fontFamily: 'AlibabaSans, sans-serif',
              cursor: card.tokenBreakdown ? 'help' : undefined,
            }}
          >
            {valueText}
          </Typography.Title>
        );

        return (
          <Col key={card.key} xs={12} sm={12} md={8} lg={8} xl={4}>
            <ProCard
              bodyStyle={{
                padding: '18px 16px',
                minHeight: 108,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -18,
                  top: -20,
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  background: theme.soft,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: theme.main,
                    boxShadow: `0 8px 18px ${theme.shadow}`,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Typography.Text style={{ color: '#5f6b7a', fontSize: 13 }}>
                    {card.title}
                  </Typography.Text>
                  {card.tokenBreakdown ? (
                    <Tooltip
                      title={
                        <TokenBreakdownTooltip
                          breakdown={card.tokenBreakdown}
                        />
                      }
                    >
                      {valueNode}
                    </Tooltip>
                  ) : (
                    valueNode
                  )}
                </div>
              </div>
            </ProCard>
          </Col>
        );
      })}
    </Row>
  );
};

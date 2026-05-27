import {
  FolderOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Card, Col, Row } from 'antd';
import React from 'react';
import type { ProjectListStats } from '@/services/projects';
import { useProjectPageStyles } from '../projectStyles';
import { formatCount } from '../projectUtils';

type ProjectStatCardsProps = {
  stats: ProjectListStats;
};

const items = [
  {
    key: 'total',
    name: '项目总数',
    icon: <FolderOutlined />,
    iconClass: 'metricIconBlue' as const,
  },
  {
    key: 'normal',
    name: '正常项目',
    icon: <SafetyCertificateOutlined />,
    iconClass: 'metricIconGreen' as const,
  },
  {
    key: 'risk',
    name: '风险项目',
    icon: <WarningOutlined />,
    iconClass: 'metricIconOrange' as const,
  },
  {
    key: 'scannedToday',
    name: '今日扫描',
    icon: <RadarChartOutlined />,
    iconClass: 'metricIconPurple' as const,
  },
];

const ProjectStatCards: React.FC<ProjectStatCardsProps> = ({ stats }) => {
  const { styles } = useProjectPageStyles();

  const values: Record<string, number> = {
    total: stats.total,
    normal: stats.normal,
    risk: stats.risk,
    scannedToday: stats.scannedToday,
  };

  return (
    <Row gutter={[14, 14]} className={styles.metricsRow}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} md={12} lg={6} flex="1 1 160px">
          <Card className={styles.metricCard} bordered={false}>
            <div className={styles[item.iconClass]}>{item.icon}</div>
            <div>
              <div className={styles.metricName}>{item.name}</div>
              <div className={styles.metricValue}>
                {formatCount(values[item.key] ?? 0)}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProjectStatCards;

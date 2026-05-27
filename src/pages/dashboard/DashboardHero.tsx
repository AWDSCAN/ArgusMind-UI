import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Space, Typography } from 'antd';
import React from 'react';
import type { DashboardHeader } from '@/services/dashboard';
import {
  heroSubtitle,
  heroTitle,
  heroWrap,
  miniStatCard,
  statusPill,
} from './dashboardStyles';

export type DashboardHeroProps = {
  header?: DashboardHeader;
  onRefresh: () => void;
};

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  header,
  onRefresh,
}) => {
  const isNormal = header?.systemStatus !== 'degraded';
  const running = header?.onlineScanNodes ?? 0;
  const queue = header?.scanQueueSize ?? 0;

  return (
    <div style={heroWrap}>
      <span style={{ display: 'block' }}>
        <Typography.Title level={3} style={heroTitle}>
          欢迎回来，Administrator 👋
        </Typography.Title>
      </span>

      <Space wrap align="center">
        <Space size={12} wrap></Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push('/tasks')}
        >
          创建任务
        </Button>
      </Space>
    </div>
  );
};

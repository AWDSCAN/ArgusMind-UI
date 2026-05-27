import { Pie } from '@ant-design/plots';
import { Empty, Typography } from 'antd';
import React, { useMemo } from 'react';
import type { DistributionSlice } from '@/services/dashboard';
import { chartCardBody } from './dashboardStyles';

const PIE_SIZE = 200;

const STATUS_COLORS: Record<string, string> = {
  运行中: '#1677ff',
  已完成: '#22c55e',
  待执行: '#fa8c16',
  失败: '#ef4444',
  已取消: '#8c8c8c',
};

export type TaskStatusPieProps = {
  data: DistributionSlice[];
  plotTheme: 'light' | 'dark';
};

export const TaskStatusPie: React.FC<TaskStatusPieProps> = ({
  data,
  plotTheme,
}) => {
  const pieData = useMemo(
    () =>
      data.map((s) => ({
        type: s.label,
        value: s.count,
      })),
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, s) => sum + s.count, 0),
    [data],
  );

  if (!pieData.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无任务数据"
        style={{ marginTop: 80 }}
      />
    );
  }

  const colorRange = pieData.map((d) => STATUS_COLORS[d.type] ?? '#1677ff');

  return (
    <div
      style={{
        ...chartCardBody,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: PIE_SIZE,
          height: PIE_SIZE,
          flexShrink: 0,
        }}
      >
        <Pie
          theme={plotTheme}
          data={pieData}
          angleField="value"
          colorField="type"
          width={PIE_SIZE}
          height={PIE_SIZE}
          innerRadius={0.62}
          radius={0.72}
          legend={false}
          scale={{ color: { range: colorRange } }}
          label={false}
          tooltip={{
            title: (d: { type: string }) => d.type,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography.Title level={2} style={{ margin: 0, lineHeight: 1.2 }}>
            {total}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            总任务数
          </Typography.Text>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {pieData.map((item) => (
          <div
            key={item.type}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: STATUS_COLORS[item.type] ?? '#1677ff',
                flexShrink: 0,
              }}
            />
            <Typography.Text style={{ flex: 1 }}>{item.type}</Typography.Text>
            <Typography.Text type="secondary">{item.value}</Typography.Text>
          </div>
        ))}
      </div>
    </div>
  );
};

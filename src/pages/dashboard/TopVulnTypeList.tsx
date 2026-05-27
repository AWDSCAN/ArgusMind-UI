import { Empty, Typography } from 'antd';
import React, { useMemo } from 'react';
import type { TopVulnType } from '@/services/dashboard';
import { rankBarBg, rankRow } from './dashboardStyles';

export type TopVulnTypeListProps = {
  items: TopVulnType[];
};

export const TopVulnTypeList: React.FC<TopVulnTypeListProps> = ({ items }) => {
  const rows = useMemo(() => {
    if (!items.length) return [];
    const max = Math.max(...items.map((i) => i.count), 1);
    return items.map((item) => ({
      ...item,
      pct: Math.round((item.count / max) * 100),
    }));
  }, [items]);

  if (!rows.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无数据"
        style={{ marginTop: 48 }}
      />
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      {rows.map((row) => (
        <div key={row.type} style={rankRow}>
          <Typography.Text ellipsis title={row.type}>
            {row.type}
          </Typography.Text>
          <span style={rankBarBg}>
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${row.pct}%`,
                background: '#1677ff',
                borderRadius: 999,
              }}
            />
          </span>
          <Typography.Text strong>{row.count}</Typography.Text>
        </div>
      ))}
    </div>
  );
};

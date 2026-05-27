import { Segmented } from 'antd';
import React from 'react';
import {
  DASHBOARD_TREND_RANGES,
  type DashboardTrendRangeKey,
} from './dashboardTrendRange';

export type TrendRangeSegmentedProps = {
  value: DashboardTrendRangeKey;
  onChange: (value: DashboardTrendRangeKey) => void;
  disabled?: boolean;
};

export const TrendRangeSegmented: React.FC<TrendRangeSegmentedProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <Segmented
    size="small"
    disabled={disabled}
    value={value}
    options={DASHBOARD_TREND_RANGES.map((r) => ({
      label: r.label,
      value: r.key,
    }))}
    onChange={(v) => onChange(v as DashboardTrendRangeKey)}
  />
);

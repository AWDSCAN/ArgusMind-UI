export type DashboardTrendRangeKey = '7d' | '1m' | '3m' | '6m' | '1y';

export type DashboardTrendRangeOption = {
  key: DashboardTrendRangeKey;
  label: string;
  days: number;
};

export const DASHBOARD_TREND_RANGES: DashboardTrendRangeOption[] = [
  { key: '7d', label: '7天', days: 7 },
  { key: '1m', label: '一个月', days: 30 },
  { key: '3m', label: '3个月', days: 90 },
  { key: '6m', label: '半年', days: 180 },
  { key: '1y', label: '一年', days: 365 },
];

export const DEFAULT_TREND_RANGE: DashboardTrendRangeKey = '7d';

export function trendRangeToDays(key: DashboardTrendRangeKey): number {
  return DASHBOARD_TREND_RANGES.find((r) => r.key === key)?.days ?? 7;
}

export function trendRangeLabel(key: DashboardTrendRangeKey): string {
  return DASHBOARD_TREND_RANGES.find((r) => r.key === key)?.label ?? '7天';
}

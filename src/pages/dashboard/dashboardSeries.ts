import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type {
  DailySeverityStatRaw,
  DailyTokenStatRaw,
} from '@/services/dashboardApi';

dayjs.extend(utc);

const EMPTY_SEVERITY = (): Omit<DailySeverityStatRaw, 'date'> => ({
  info: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
  unknown: 0,
});

/** 按 UTC 日历补齐最近 N 天（接口可能缺日） */
export function fillDailySeverity(
  rows: DailySeverityStatRaw[],
  days: number,
): DailySeverityStatRaw[] {
  const map = new Map(rows.map((r) => [r.date, r]));
  const out: DailySeverityStatRaw[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs.utc().subtract(i, 'day').format('YYYY-MM-DD');
    out.push(map.get(date) ?? { date, ...EMPTY_SEVERITY() });
  }
  return out;
}

export function fillDailyToken(
  rows: DailyTokenStatRaw[],
  days: number,
): DailyTokenStatRaw[] {
  const map = new Map(rows.map((r) => [r.date, r]));
  const out: DailyTokenStatRaw[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs.utc().subtract(i, 'day').format('YYYY-MM-DD');
    out.push(
      map.get(date) ?? {
        date,
        llm_input: 0,
        llm_output: 0,
        code_agent_input: 0,
        code_agent_output: 0,
        total: 0,
      },
    );
  }
  return out;
}

export function todayUtcDate(): string {
  return dayjs.utc().format('YYYY-MM-DD');
}

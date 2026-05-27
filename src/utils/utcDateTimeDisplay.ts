import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** ISO/RFC3339 已带 Z 或 ±偏移时视为「已标明时区」 */
function hasExplicitZone(isoLike: string): boolean {
  const t = isoLike.trim();
  if (!t) return false;
  if (/Z$/i.test(t)) return true;
  return /[+-]\d{2}:\d{2}$/.test(t) || /[+-]\d{4}$/.test(t);
}

/**
 * 将后台常见串转成 dayjs.utc 可解析的 ISO 墙钟（无时区部分）。
 * 例：`2026-05-10 03:37:11.778` → `2026-05-10T03:37:11.778`
 */
function normalizeBackendUtcWallClock(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (t.includes('T')) return t;
  return t.replace(/\s+/, 'T');
}

/**
 * 将接口返回的时间解析为「绝对时刻」后，用 dayjs 表示为**本地时区**下的时间（用于展示或取 epoch）。
 *
 * 约定：库中存 UTC。常见下发：`2026-05-10 03:37:11.778`（空格、毫秒、无 Z）——按 **UTC 墙钟** 解析，再转为浏览器本地时区展示。
 * 若串已带 `Z` 或 `±hh:mm`，则按 RFC3339 解析，不再强行加 UTC 假设。
 */
export function parseApiUtcToLocalDayjs(
  input: string | null | undefined,
): dayjs.Dayjs {
  if (input == null || !String(input).trim()) {
    return dayjs('');
  }
  const raw = String(input).trim();
  if (hasExplicitZone(raw)) {
    return dayjs(raw);
  }
  return dayjs.utc(normalizeBackendUtcWallClock(raw)).local();
}

/** 格式化为当前浏览器本地时区下的时间字符串 */
export function formatUtcForLocalDisplay(
  input: string | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  const d = parseApiUtcToLocalDayjs(input);
  return d.isValid() ? d.format(format) : '—';
}

/** 用于排序、倒计时的 epoch 毫秒（与本地展示一致的正确瞬间） */
export function utcApiStringToEpochMs(
  input: string | null | undefined,
): number | null {
  const d = parseApiUtcToLocalDayjs(input);
  return d.isValid() ? d.valueOf() : null;
}

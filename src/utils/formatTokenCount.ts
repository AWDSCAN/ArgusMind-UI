/** 大模型场景常用的 Token 紧凑展示（k / M / B） */
export function formatTokenCount(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const n = Math.round(value);
  if (n === 0) return '0';

  const trim = (s: string) => s.replace(/\.0$/, '');

  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    return `${trim((n / 1_000_000_000).toFixed(1))}B`;
  }
  if (abs >= 1_000_000) {
    return `${trim((n / 1_000_000).toFixed(1))}M`;
  }
  if (abs >= 1_000) {
    return `${trim((n / 1_000).toFixed(1))}k`;
  }
  return String(n);
}

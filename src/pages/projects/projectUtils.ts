import dayjs from 'dayjs';
import type {
  ProjectHealthStatus,
  ProjectLanguageStats,
  ProjectListItem,
  ProjectSourceType,
} from '@/services/projects';

export type ProjectSortKey = 'default' | 'name' | 'vuln' | 'lines';

export type LanguageSlice = {
  name: string;
  code: number;
  lines: number;
  percent: number;
  color: string;
};

const LINGUIST_COLORS: Record<string, string> = {
  JavaScript: '#facc15',
  TypeScript: '#3178c6',
  Python: '#3b82f6',
  Java: '#b07219',
  Go: '#00ADD8',
  Vue: '#22c55e',
  JSON: '#22c55e',
  Markdown: '#3b82f6',
  YAML: '#cb171e',
};

export function getLanguageBarColor(languageName: string) {
  if (LINGUIST_COLORS[languageName]) return LINGUIST_COLORS[languageName];
  let hash = 0;
  for (const ch of languageName) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  }
  return `hsl(${hash}, 52%, 46%)`;
}

/** 比例条：仅 code > 0 的语言 */
export function getLanguageBreakdown(
  language: ProjectLanguageStats | null | undefined,
): LanguageSlice[] {
  if (!language?.languages) return [];

  const entries = Object.entries(language.languages).map(([name, stat]) => ({
    name,
    code: stat.code ?? 0,
    lines: stat.lines ?? 0,
  }));

  const codeEntries = entries.filter((e) => e.code > 0);
  const totalCode =
    codeEntries.reduce((sum, e) => sum + e.code, 0) ||
    language.total?.code ||
    0;
  if (totalCode <= 0) return [];

  return codeEntries
    .sort((a, b) => b.code - a.code)
    .map((e) => ({
      ...e,
      percent: (e.code / totalCode) * 100,
      color: getLanguageBarColor(e.name),
    }));
}

/** 图例列表：含 code=0 但有 lines 的语言（如 Markdown） */
export function getLanguageLegendItems(
  language: ProjectLanguageStats | null | undefined,
) {
  if (!language?.languages) return [];
  const barNames = new Set(getLanguageBreakdown(language).map((s) => s.name));

  const fromBar = getLanguageBreakdown(language).map((s) => ({
    name: s.name,
    color: s.color,
    display: formatCount(s.code),
    suffix: '',
  }));

  const zeroCode = Object.entries(language.languages)
    .filter(([name, stat]) => !barNames.has(name) && (stat.lines ?? 0) > 0)
    .map(([name, stat]) => ({
      name,
      color: getLanguageBarColor(name),
      display: formatCount(stat.lines ?? 0),
      suffix: ' 行',
    }));

  return [...fromBar, ...zeroCode].slice(0, 5);
}

export function countLanguages(
  language: ProjectLanguageStats | null | undefined,
) {
  if (!language?.languages) return 0;
  return Object.keys(language.languages).length;
}

export function getPrimaryLanguageName(
  language: ProjectLanguageStats | null | undefined,
): string | undefined {
  return getLanguageBreakdown(language)[0]?.name;
}

export function getLanguageMeta(languageName?: string) {
  const name = languageName || '其他';
  const lang = name.toLowerCase();
  const color = getLanguageBarColor(name);

  if (lang.includes('java') && !lang.includes('javascript')) {
    return { label: 'Java', icon: 'J', color };
  }
  if (lang.includes('typescript')) {
    return { label: 'TS', icon: 'TS', color };
  }
  if (lang.includes('javascript')) {
    return { label: 'JS', icon: '</>', color };
  }
  if (lang.includes('python')) {
    return { label: 'Py', icon: 'Py', color };
  }
  if (lang.includes('vue')) {
    return { label: 'Vue', icon: 'Vue', color };
  }
  if (lang.includes('go')) {
    return { label: 'Go', icon: 'Go', color };
  }
  return { label: name, icon: name.slice(0, 2), color };
}

export function getSourceTypeLabel(type: ProjectSourceType | null) {
  if (type === 'git') return 'Git 仓库';
  if (type === 'upload') return '压缩包';
  if (type === 'path') return '可访问路径';
  return '未知来源';
}

export const healthStatusMeta: Record<
  ProjectHealthStatus,
  { label: string; className: 'ok' | 'warn' | 'pending' }
> = {
  normal: { label: '正常', className: 'ok' },
  risk: { label: '风险', className: 'warn' },
  pending_scan: { label: '待扫描', className: 'pending' },
};

export function formatCount(n: number) {
  return n.toLocaleString('zh-CN');
}

export function formatLastScanned(at: string | null | undefined) {
  if (!at) return '—';
  return dayjs(at).format('YYYY-MM-DD HH:mm:ss');
}

export function sortProjects(
  projects: ProjectListItem[],
  sortKey: ProjectSortKey,
) {
  const list = [...projects];
  if (sortKey === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    return list;
  }
  if (sortKey === 'vuln') {
    list.sort((a, b) => b.vulnerabilityCount - a.vulnerabilityCount);
    return list;
  }
  if (sortKey === 'lines') {
    list.sort((a, b) => b.lineCount - a.lineCount);
    return list;
  }
  return list;
}

export function computeStatsFromList(
  projects: ProjectListItem[],
  total: number,
) {
  const today = dayjs().format('YYYY-MM-DD');
  return {
    total,
    normal: projects.filter((p) => p.healthStatus === 'normal').length,
    risk: projects.filter((p) => p.healthStatus === 'risk').length,
    pendingScan: projects.filter((p) => p.healthStatus === 'pending_scan')
      .length,
    scannedToday: projects.filter((p) => p.lastScannedAt?.startsWith(today))
      .length,
    totalVulnerabilities: projects.reduce(
      (s, p) => s + p.vulnerabilityCount,
      0,
    ),
  };
}

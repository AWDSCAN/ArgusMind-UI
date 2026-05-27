export function formatAsExpandedJsonIfPossible(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '-';
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  }
  return String(value);
}

export function makeLanguageGroupId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `lg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export type PlanRow = {
  id: string;
  /** Stable bucket: multiple languages can have empty `language` without merging */
  language_group_id: string;
  language: string;
  /** `languages[].level` */
  language_level: number;
  category_name: string;
  /** `risk_categories[].level` */
  level: number;
  risk_description: string;
  reasoning_basis: string;
};

export type HumanApprovalPayload = {
  interaction_type?: string;
  message?: string;
  created_at?: string;
  timeout_seconds?: number;
  approved?: boolean;
  decided_by?: string;
};

export type OrderedLanguageGroup = {
  language_group_id: string;
  language: string;
  language_level: number;
  rows: PlanRow[];
};

export function buildOrderedLanguageGroups(
  rows: PlanRow[],
): OrderedLanguageGroup[] {
  const byGid = new Map<string, PlanRow[]>();
  const gidOrder: string[] = [];
  for (const row of rows) {
    const gid = row.language_group_id || row.id;
    let bucket = byGid.get(gid);
    if (!bucket) {
      bucket = [];
      byGid.set(gid, bucket);
      gidOrder.push(gid);
    }
    bucket.push(row);
  }
  return gidOrder.map((gid) => {
    const groupRows = byGid.get(gid) ?? [];
    const first = groupRows[0];
    return {
      language_group_id: gid,
      language: first?.language ?? '',
      language_level: Number(first?.language_level) || 1,
      rows: groupRows,
    };
  });
}

export function parsePlanRowsFromMessage(messageText?: string): PlanRow[] {
  if (!messageText) return [];
  try {
    const parsed = JSON.parse(messageText) as {
      languages?: Array<{
        language?: string;
        level?: number;
        risk_categories?: Array<{
          category_name?: string;
          level?: number;
          risk_description?: string;
          reasoning_basis?: string;
        }>;
      }>;
    };
    const rows: PlanRow[] = [];
    (parsed.languages ?? []).forEach((lang, langIndex) => {
      const language_group_id = makeLanguageGroupId();
      const language = String(lang.language ?? '');
      const language_level = Number(lang.level ?? 1) || 1;
      (lang.risk_categories ?? []).forEach((category, catIndex) => {
        rows.push({
          id: `${language || 'lang'}-${langIndex}-${catIndex}-${Date.now()}`,
          language_group_id,
          language,
          language_level,
          category_name: String(category.category_name ?? ''),
          level: Number(category.level ?? lang.level ?? 1) || 1,
          risk_description: String(category.risk_description ?? ''),
          reasoning_basis: String(category.reasoning_basis ?? ''),
        });
      });
      if ((lang.risk_categories ?? []).length === 0) {
        rows.push({
          id: `${language || 'lang'}-${langIndex}-${Date.now()}`,
          language_group_id,
          language,
          language_level,
          category_name: '',
          level: Number(lang.level ?? 1) || 1,
          risk_description: '',
          reasoning_basis: '',
        });
      }
    });
    return rows;
  } catch {
    return [];
  }
}

export function serializePlanRowsToMessage(rows: PlanRow[]): string {
  const byGid = new Map<string, PlanRow[]>();
  const gidOrder: string[] = [];
  for (const row of rows) {
    const gid = row.language_group_id || row.id;
    let bucket = byGid.get(gid);
    if (!bucket) {
      bucket = [];
      byGid.set(gid, bucket);
      gidOrder.push(gid);
    }
    bucket.push(row);
  }
  const languages = gidOrder.map((gid) => {
    const groupRows = byGid.get(gid) ?? [];
    const first = groupRows[0];
    return {
      language: first?.language || 'Unknown',
      level: Number(first?.language_level) || 1,
      risk_categories: groupRows.map((row) => ({
        category_name: row.category_name || '',
        level: Number(row.level) || 1,
        risk_description: row.risk_description || '',
        reasoning_basis: row.reasoning_basis || '',
      })),
    };
  });
  return JSON.stringify({ languages });
}

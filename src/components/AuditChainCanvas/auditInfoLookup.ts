import type {
  AuditChainRawGraph,
  AuditChainRawNode,
} from '@/types/auditSessionDetail';
import { asNodeLabel } from './constants';
import type { ConnectedAuditInfo } from './types';

function auditInfoTitle(props: Record<string, unknown>): string {
  return String(
    props.title ?? props.summary ?? props.name ?? props.message ?? '审计信息',
  ).slice(0, 120);
}

function auditInfoSubtitle(props: Record<string, unknown>): string | undefined {
  const kind = props.kind ?? props.info_type ?? props.category;
  const src = props.source ?? props.origin;
  const parts = [kind, src]
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map((v) => String(v));
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function rawNodeToConnectedAuditInfo(
  node: AuditChainRawNode,
): ConnectedAuditInfo | null {
  if (asNodeLabel(node.labels) !== 'AuditInfo') return null;
  const props = node.props ?? {};
  return {
    elementId: node.elementId,
    title: auditInfoTitle(props),
    subtitle: auditInfoSubtitle(props),
    props,
  };
}

/** 查找与指定节点直接相连的 AuditInfo 节点（基于原始图谱边，含画布隐藏的节点） */
export function findConnectedAuditInfos(
  raw: AuditChainRawGraph | null | undefined,
  nodeId: string,
): ConnectedAuditInfo[] {
  const id = nodeId.trim();
  if (!raw || !id) return [];

  const auditById = new Map<string, ConnectedAuditInfo>();
  for (const n of raw.nodes) {
    const item = rawNodeToConnectedAuditInfo(n);
    if (item) auditById.set(item.elementId, item);
  }
  if (auditById.size === 0) return [];

  const seen = new Set<string>();
  const result: ConnectedAuditInfo[] = [];

  for (const e of raw.edges) {
    let otherId: string | null = null;
    if (e.start === id) otherId = e.end;
    else if (e.end === id) otherId = e.start;
    else continue;

    const info = auditById.get(otherId);
    if (!info || seen.has(info.elementId)) continue;
    seen.add(info.elementId);
    result.push(info);
  }

  return result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
}

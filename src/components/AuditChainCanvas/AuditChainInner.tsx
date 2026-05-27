import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { Empty, Spin } from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuditChainRawGraph } from '@/types/auditSessionDetail';
import AuditEdge from './AuditEdge';
import AuditNode from './AuditNode';
import {
  ANALYSIS_SAFE_EDGE_COLOR,
  isAnalysisSafeVerdict,
  resolveAnalysisResultUi,
} from './analysisResultUi';
import { findConnectedAuditInfos } from './auditInfoLookup';
import {
  EDGE_COLOR,
  FALLBACK_STYLE,
  NODE_HEIGHT,
  NODE_STYLE,
  NODE_WIDTH,
  type RunStatus,
} from './constants';
import {
  createAuditChainDefaultFilter,
  EMPTY_FILTER,
  type FilterState,
} from './FilterPopover';
import Header from './Header';
import Legend from './Legend';
import NodeDetailPanel from './NodeDetailPanel';
import { buildGraph, layoutGraph } from './transform';
import type {
  AuditFlowEdge,
  AuditFlowEdgeData,
  AuditFlowNode,
  AuditFlowNodeData,
  ConnectedAuditInfo,
} from './types';

const NODE_TYPES = { audit: AuditNode } as const;
const EDGE_TYPES = { audit: AuditEdge } as const;

function miniMapNodeColor(node: Node) {
  const data = node.data as Partial<AuditFlowNodeData> | undefined;
  const label = data?.label;
  if (!label) return FALLBACK_STYLE.accent;
  if (label === 'AnalysisResult' && data?.raw) {
    const ui = resolveAnalysisResultUi(data.raw as Record<string, unknown>);
    return ui.levelBar;
  }
  if (label === 'AuditStage') {
    const s = (data?.status ?? 'pending') as RunStatus;
    if (s === 'running') return '#2563eb';
    if (s === 'completed') return '#059669';
    if (s === 'failed') return '#dc2626';
    return '#64748b';
  }
  return (NODE_STYLE[label] ?? FALLBACK_STYLE).accent;
}

/**
 * 判断「旧 → 新」是否为同一张拓扑：节点 id 集合一致 + 边（id + source + target）一致。
 * 用于在数据更新时决定是否需要重跰 ELK 布局。整体 O(n)。
 */
function isSameTopology(
  curNodes: AuditFlowNode[],
  curEdges: AuditFlowEdge[],
  nextNodes: AuditFlowNode[],
  nextEdges: AuditFlowEdge[],
): boolean {
  if (
    curNodes.length !== nextNodes.length ||
    curEdges.length !== nextEdges.length
  ) {
    return false;
  }
  const curNodeIds = new Set<string>();
  for (const n of curNodes) curNodeIds.add(n.id);
  for (const n of nextNodes) {
    if (!curNodeIds.has(n.id)) return false;
  }
  const curEdgeKeys = new Set<string>();
  for (const e of curEdges) {
    curEdgeKeys.add(`${e.id}|${e.source}|${e.target}`);
  }
  for (const e of nextEdges) {
    if (!curEdgeKeys.has(`${e.id}|${e.source}|${e.target}`)) return false;
  }
  return true;
}

function buildEdgeAdjacency(edges: AuditFlowEdge[]) {
  const outAdj = new Map<string, AuditFlowEdge[]>();
  const inAdj = new Map<string, AuditFlowEdge[]>();
  for (const e of edges) {
    const outBucket = outAdj.get(e.source) ?? [];
    outBucket.push(e);
    outAdj.set(e.source, outBucket);
    const inBucket = inAdj.get(e.target) ?? [];
    inBucket.push(e);
    inAdj.set(e.target, inBucket);
  }
  return { outAdj, inAdj };
}

function computeVulnChain(
  nodes: AuditFlowNode[],
  inAdj: Map<string, AuditFlowEdge[]>,
  filter: FilterState,
): Set<string> | null {
  const vulnFilterActive =
    filter.verdict.size > 0 || filter.verification.size > 0;
  if (!vulnFilterActive) return null;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const passing: string[] = [];
  for (const n of nodes) {
    if (n.data.label !== 'AnalysisResult') continue;
    const raw = (n.data.raw ?? {}) as Record<string, any>;
    if (filter.verdict.size > 0 && !filter.verdict.has(raw.verdict as never)) {
      continue;
    }
    if (
      filter.verification.size > 0 &&
      !filter.verification.has(raw.verification_status as never)
    ) {
      continue;
    }
    passing.push(n.id);
  }
  const chain = new Set<string>(passing);
  const stack = [...passing];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (cur === undefined) break;
    for (const e of inAdj.get(cur) ?? []) {
      const pred = nodeMap.get(e.source);
      if (!pred) continue;
      if (pred.data.label === 'RiskCategory') continue;
      if (!chain.has(pred.id)) {
        chain.add(pred.id);
        stack.push(pred.id);
      }
    }
  }
  return chain;
}

/**
 * 沿入边从所有 `AnalysisResult` 反向可达的节点：即从该节点出发沿出边正向能到达某个结果节点。
 * 用于漏洞筛选时：无结果下游的分支不套用「仅显示命中链」逻辑，仍按 status 筛选。
 */
function computeReachAnyAnalysisResultClosure(
  nodes: AuditFlowNode[],
  inAdj: Map<string, AuditFlowEdge[]>,
): Set<string> {
  const seeds: string[] = [];
  for (const n of nodes) {
    if (n.data.label === 'AnalysisResult') seeds.push(n.id);
  }
  const closure = new Set<string>(seeds);
  const stack = [...seeds];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (cur === undefined) break;
    for (const e of inAdj.get(cur) ?? []) {
      if (closure.has(e.source)) continue;
      closure.add(e.source);
      stack.push(e.source);
    }
  }
  return closure;
}

function computeVisibleIds(
  nodes: AuditFlowNode[],
  {
    outAdj,
    inAdj,
  }: {
    outAdj: Map<string, AuditFlowEdge[]>;
    inAdj: Map<string, AuditFlowEdge[]>;
  },
  filter: FilterState,
  vulnChain: Set<string> | null,
): Set<string> {
  const reachAnyAnalysisResult =
    vulnChain !== null
      ? computeReachAnyAnalysisResultClosure(nodes, inAdj)
      : null;
  const statusFilterActive = filter.status.size > 0;
  const visible = new Set<string>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n] as const));

  const isAlwaysVisible = (label: AuditFlowNodeData['label']) =>
    label === 'Task' || label === 'AuditStage';

  for (const n of nodes) {
    const label = n.data.label;
    if (label === 'Knowledge' || label === 'AuditInfo') continue;

    if (isAlwaysVisible(label)) {
      visible.add(n.id);
      continue;
    }

    if (vulnChain) {
      const onPathToSomeResult = reachAnyAnalysisResult?.has(n.id) ?? false;
      if (onPathToSomeResult) {
        if (label === 'AnalysisResult') {
          if (vulnChain.has(n.id)) visible.add(n.id);
          continue;
        }
        if (vulnChain.has(n.id)) {
          visible.add(n.id);
          continue;
        }
        if (label === 'SinkFlowNode' || label === 'ChainNode') continue;
      }
    }

    if (!statusFilterActive) {
      visible.add(n.id);
      continue;
    }
    const s = n.data.status;
    if (s && filter.status.has(s as never)) visible.add(n.id);
  }

  const visitAdjacent = (nodeId: string, fn: (otherId: string) => void) => {
    for (const e of outAdj.get(nodeId) ?? []) fn(e.target);
    for (const e of inAdj.get(nodeId) ?? []) fn(e.source);
  };

  for (const n of nodes) {
    if (n.data.label !== 'Knowledge') continue;
    let show = false;
    visitAdjacent(n.id, (otherId) => {
      if (show) return;
      const other = nodeMap.get(otherId);
      if (
        other &&
        visible.has(otherId) &&
        other.data.label === 'RiskCategory'
      ) {
        show = true;
      }
    });
    if (show) visible.add(n.id);
  }

  return visible;
}

/** 过滤 / 可见性相关字段变化时触发子图或全图 ELK（不含仅 position 变化） */
function filterRelayoutTriggerKey(
  nodes: AuditFlowNode[],
  edges: AuditFlowEdge[],
  filter: FilterState,
): string {
  const parts = [
    String(nodes.length),
    String(edges.length),
    [...filter.status].sort().join(','),
    [...filter.verdict].sort().join(','),
    [...filter.verification].sort().join(','),
  ];
  for (const n of [...nodes].sort((a, b) => a.id.localeCompare(b.id))) {
    const r = (n.data.raw ?? {}) as Record<string, unknown>;
    parts.push(
      `${n.id}\t${n.data.label}\t${String(n.data.status ?? '')}\t${String(r.verdict ?? '')}\t${String(r.verification_status ?? '')}`,
    );
  }
  parts.push(
    [...edges]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((e) => `${e.id}\t${e.source}\t${e.target}`)
      .join('\n'),
  );
  return parts.join('\n');
}

export type AuditChainFocusNodeRequest = {
  /** Neo4j elementId，与 React Flow 节点 `id` 一致 */
  elementId: string;
  /** 每次请求递增，便于重复点击同一节点也能再次触发聚焦 */
  nonce: number;
};

export type AuditChainInnerProps = {
  /** 用于切换任务时重置内部选中态 / 适配视图 */
  graphKey: string;
  raw: AuditChainRawGraph | null;
  taskName?: string;
  headerExtraRight?: React.ReactNode;
  /** 外部请求聚焦某节点（与画布内点击节点行为一致） */
  focusNodeRequest?: AuditChainFocusNodeRequest | null;
  showFilterAndFollowLatest?: boolean;
};

const AuditChainInner: React.FC<AuditChainInnerProps> = ({
  graphKey,
  raw,
  taskName,
  headerExtraRight,
  focusNodeRequest,
  showFilterAndFollowLatest = true,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<AuditFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AuditFlowEdge>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(() =>
    showFilterAndFollowLatest ? createAuditChainDefaultFilter() : EMPTY_FILTER,
  );
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const [layouting, setLayouting] = useState(false);
  const [relayouting, setRelayouting] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [followLatestNode, setFollowLatestNode] = useState(
    showFilterAndFollowLatest,
  );
  const followLatestNodeRef = useRef(true);
  useEffect(() => {
    followLatestNodeRef.current = followLatestNode;
  }, [followLatestNode]);
  const { fitView, setCenter, getZoom } = useReactFlow();
  const isEmpty = !raw || raw.nodes.length === 0;

  const [nodeTypes] = useState(NODE_TYPES);
  const [edgeTypes] = useState(EDGE_TYPES);

  // 让数据更新逻辑读取最新的 nodes/edges 而不需把它们当作 effect 依赖
  // 否则每次 setNodes/setEdges 都会触发 effect 死循环。
  const nodesRef = useRef<AuditFlowNode[]>(nodes);
  const edgesRef = useRef<AuditFlowEdge[]>(edges);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  /**
   * 首次为当前 graphKey 完成布局后置 true：
   * - 同任务内的数据更新（拓扑或仅 data 变化）不再做 `fitView`，
   *   保留用户当前的视口 / 缩放。
   * - 切任务时由 `graphKey` 副作用清零，下一次布局会重新 fit-view。
   */
  const initialLayoutDoneRef = useRef(false);

  /**
   * raw 拓扑布局刚完成且与当前过滤下的「全显」一致时，与 filter effect 的
   * filterRelayoutTriggerKey 相同 → 跳过 filter 内重复的全图 ELK + fitView，
   * 避免盖住「跟随最新节点」的视口。
   */
  const rawLayoutSkipFilterKeyRef = useRef<string | null>(null);
  /** 拓扑增量后待 fitView 的新节点 id（由 raw 写入，由 filter effect 统一 rAF 消费） */
  const pendingFollowNewNodeIdsRef = useRef<string[] | null>(null);
  /** 用户手动拖拽过的节点：过滤重布局时保留其坐标 */
  const userPositionedIdsRef = useRef(new Set<string>());

  const lastSuccessfulExternalFocusNonceRef = useRef(0);

  useEffect(() => {
    setSelectedId(null);
    setFilter(
      showFilterAndFollowLatest
        ? createAuditChainDefaultFilter()
        : EMPTY_FILTER,
    );
    setFollowLatestNode(showFilterAndFollowLatest);
    initialLayoutDoneRef.current = false;
    rawLayoutSkipFilterKeyRef.current = null;
    pendingFollowNewNodeIdsRef.current = null;
    userPositionedIdsRef.current.clear();
    lastSuccessfulExternalFocusNonceRef.current = 0;
  }, [graphKey, showFilterAndFollowLatest]);

  useEffect(() => {
    if (!raw || raw.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      initialLayoutDoneRef.current = false;
      rawLayoutSkipFilterKeyRef.current = null;
      pendingFollowNewNodeIdsRef.current = null;
      return;
    }

    const { rfNodes, rfEdges } = buildGraph(raw);
    const sameTopology = isSameTopology(
      nodesRef.current,
      edgesRef.current,
      rfNodes,
      rfEdges,
    );

    // 同任务内拓扑未变 → 直接原地合并 data，避免 ELK 重排版与 fit-view。
    // 这是数据更新中开销最小的路径（O(n)，无网络 / 异步）。
    if (sameTopology && initialLayoutDoneRef.current) {
      const nextById = new Map(rfNodes.map((n) => [n.id, n]));
      setNodes((prev) =>
        prev.map((n) => {
          const next = nextById.get(n.id);
          if (!next) return n;
          // 保留 React Flow 内部字段（position / selected / measured 等），
          // 只刷新业务 `data`
          return { ...n, data: { ...next.data } };
        }),
      );
      // 边的 kind / source / target 由拓扑决定；拓扑既相同则不需要更新 edges
      return;
    }

    // 拓扑发生变化（首次加载、新增/删除节点或边）→ 重新布局
    let cancelled = false;
    const isInitialLayout = !initialLayoutDoneRef.current;
    const prevIdsForFollow = new Set(nodesRef.current.map((n) => n.id));
    if (isInitialLayout) {
      setLayouting(true);
    }
    (async () => {
      try {
        const laid = await layoutGraph(rfNodes, rfEdges);
        if (cancelled) return;
        // 尽量保留旧节点的位置，避免拓扑微调时整张图发生大幅度抖动；
        // 同时把 React Flow 内部的 `selected` 等字段也带过来
        const prevNodeById = new Map(
          nodesRef.current.map((n) => [n.id, n] as const),
        );
        const mergedNodes = laid.nodes.map((n) => {
          const prev = prevNodeById.get(n.id);
          if (!prev) return n;
          return {
            ...n,
            position: prev.position ?? n.position,
            selected: prev.selected,
          };
        });

        const { outAdj: fo, inAdj: fi } = buildEdgeAdjacency(laid.edges);
        const filterNow = filterRef.current;
        const fv = computeVulnChain(mergedNodes, fi, filterNow);
        const fvisible = computeVisibleIds(
          mergedNodes,
          { outAdj: fo, inAdj: fi },
          filterNow,
          fv,
        );
        const rawAllVisible =
          mergedNodes.length > 0 && fvisible.size === mergedNodes.length;
        if (rawAllVisible) {
          rawLayoutSkipFilterKeyRef.current = filterRelayoutTriggerKey(
            mergedNodes,
            laid.edges,
            filterNow,
          );
        } else {
          rawLayoutSkipFilterKeyRef.current = null;
        }

        pendingFollowNewNodeIdsRef.current = null;
        if (
          !isInitialLayout &&
          followLatestNodeRef.current &&
          prevIdsForFollow.size > 0
        ) {
          const added = mergedNodes.filter((n) => !prevIdsForFollow.has(n.id));
          if (added.length > 0) {
            pendingFollowNewNodeIdsRef.current = added.map((n) => n.id);
          }
        }

        setNodes(mergedNodes);
        setEdges(laid.edges);

        if (isInitialLayout) {
          // 仅在「初次拿到数据」时主动 fit-view，避免数据更新打断用户视口
          requestAnimationFrame(() => {
            fitView({
              padding: 0.18,
              duration: 500,
              maxZoom: 1.2,
              minZoom: 0.15,
            });
          });
        }
        // 非首次拓扑增量下的「跟随最新节点」视口由 filter effect 末尾统一 rAF，
        // 避免与子图 ELK / 全图 fitView 顺序竞争导致视口乱跳或未跟上。
        initialLayoutDoneRef.current = true;
      } finally {
        if (!cancelled && isInitialLayout) {
          setLayouting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [raw, fitView, setNodes, setEdges]);

  // 若被选中的节点在最新拓扑中已不存在，则清除选中态（不影响过滤态 / 视口）
  useEffect(() => {
    if (!selectedId) return;
    if (!nodes.some((n) => n.id === selectedId)) {
      setSelectedId(null);
    }
  }, [nodes, selectedId]);

  const { outAdj, inAdj } = useMemo(() => {
    const out = new Map<string, AuditFlowEdge[]>();
    const inn = new Map<string, AuditFlowEdge[]>();
    for (const e of edges) {
      const outBucket = out.get(e.source) ?? [];
      outBucket.push(e);
      out.set(e.source, outBucket);
      const inBucket = inn.get(e.target) ?? [];
      inBucket.push(e);
      inn.set(e.target, inBucket);
    }
    return { outAdj: out, inAdj: inn };
  }, [edges]);

  const computeChain = useCallback(
    (nodeId: string): Set<string> => {
      const ids = new Set<string>([nodeId]);

      const down: string[] = [nodeId];
      while (down.length > 0) {
        const cur = down.pop();
        if (cur === undefined) break;
        for (const e of outAdj.get(cur) ?? []) {
          if (!ids.has(e.target)) {
            ids.add(e.target);
            down.push(e.target);
          }
        }
      }

      const up: string[] = [nodeId];
      while (up.length > 0) {
        const cur = up.pop();
        if (cur === undefined) break;
        for (const e of inAdj.get(cur) ?? []) {
          if (!ids.has(e.source)) {
            ids.add(e.source);
            up.push(e.source);
          }
        }
      }

      return ids;
    },
    [outAdj, inAdj],
  );

  const focusedIds = useMemo(
    () => (selectedId ? computeChain(selectedId) : null),
    [selectedId, computeChain],
  );

  const focusNodeById = useCallback(
    (nodeId: string) => {
      setSelectedId(nodeId);
      window.setTimeout(() => {
        const n = nodesRef.current.find((nd) => nd.id === nodeId);
        if (!n) return;
        const measured = (
          n as AuditFlowNode & {
            measured?: { width?: number; height?: number };
          }
        ).measured;
        const w = measured?.width ?? n.width ?? NODE_WIDTH;
        const h = measured?.height ?? n.height ?? NODE_HEIGHT;
        const cx = n.position.x + w / 2;
        const cy = n.position.y + h / 2;
        setCenter(cx, cy, { zoom: getZoom(), duration: 480 });
      }, 0);
    },
    [setCenter, getZoom],
  );

  const onNodeClick: NodeMouseHandler<AuditFlowNode> = useCallback(
    (_event, node) => {
      focusNodeById(node.id);
    },
    [focusNodeById],
  );

  useEffect(() => {
    if (!focusNodeRequest) return;
    const { elementId, nonce } = focusNodeRequest;
    if (!elementId.trim()) return;
    if (lastSuccessfulExternalFocusNonceRef.current === nonce) return;
    if (!nodes.some((n) => n.id === elementId)) return;
    lastSuccessfulExternalFocusNonceRef.current = nonce;
    focusNodeById(elementId);
  }, [focusNodeRequest, nodes, focusNodeById]);

  const handleReset = useCallback(() => {
    fitView({ padding: 0.18, duration: 500 });
    setSelectedId(null);
  }, [fitView]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<AuditFlowNode>[]) => {
      for (const ch of changes) {
        if (ch.type === 'position' && ch.dragging === false) {
          userPositionedIdsRef.current.add(ch.id);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  const handleRestoreAutoLayout = useCallback(() => {
    const curNodes = nodesRef.current;
    const curEdges = edgesRef.current;
    if (curNodes.length === 0) return;

    userPositionedIdsRef.current.clear();
    setRelayouting(true);
    void (async () => {
      try {
        const laid = await layoutGraph(curNodes, curEdges);
        const prevById = new Map(curNodes.map((n) => [n.id, n] as const));
        const merged = laid.nodes.map((n) => {
          const prev = prevById.get(n.id);
          if (!prev) return n;
          return {
            ...n,
            data: prev.data,
            selected: prev.selected,
          };
        });
        setNodes(merged);

        const filterNow = filterRef.current;
        const { outAdj: oa, inAdj: ia } = buildEdgeAdjacency(curEdges);
        const vuln = computeVulnChain(merged, ia, filterNow);
        const visible = computeVisibleIds(
          merged,
          { outAdj: oa, inAdj: ia },
          filterNow,
          vuln,
        );
        const visibleNodeIds = [...visible].map((id) => ({ id }));

        requestAnimationFrame(() => {
          fitView({
            ...(visibleNodeIds.length > 0 &&
            visibleNodeIds.length < merged.length
              ? { nodes: visibleNodeIds }
              : {}),
            padding: 0.18,
            duration: 480,
            maxZoom: 1.2,
            minZoom: 0.12,
          });
        });
      } catch {
        /* 保持当前坐标 */
      } finally {
        setRelayouting(false);
      }
    })();
  }, [fitView, setNodes]);

  const vulnChain = useMemo<Set<string> | null>(
    () => computeVulnChain(nodes, inAdj, filter),
    [nodes, inAdj, filter],
  );

  const visibleIds = useMemo<Set<string>>(
    () => computeVisibleIds(nodes, { outAdj, inAdj }, filter, vulnChain),
    [nodes, outAdj, inAdj, filter, vulnChain],
  );

  const filterRelayoutKey = useMemo(
    () => filterRelayoutTriggerKey(nodes, edges, filter),
    [nodes, edges, filter],
  );

  /** 过滤可见性变化：子图 ELK 紧凑排布；恢复全显时对全图重新 ELK（无需坐标快照） */
  useEffect(() => {
    if (!initialLayoutDoneRef.current) return;
    const curNodes = nodesRef.current;
    const curEdges = edgesRef.current;
    if (curNodes.length === 0) return;

    const layoutKey = filterRelayoutTriggerKey(curNodes, curEdges, filter);
    if (rawLayoutSkipFilterKeyRef.current !== null) {
      if (rawLayoutSkipFilterKeyRef.current === layoutKey) {
        rawLayoutSkipFilterKeyRef.current = null;
        requestAnimationFrame(() => {
          const pending = pendingFollowNewNodeIdsRef.current;
          pendingFollowNewNodeIdsRef.current = null;
          if (pending && pending.length > 0 && followLatestNodeRef.current) {
            const liveNodes = nodesRef.current;
            const liveEdges = edgesRef.current;
            const { outAdj: oa2, inAdj: ia2 } = buildEdgeAdjacency(liveEdges);
            const vuln2 = computeVulnChain(liveNodes, ia2, filter);
            const visible2 = computeVisibleIds(
              liveNodes,
              { outAdj: oa2, inAdj: ia2 },
              filter,
              vuln2,
            );
            const targets = pending.filter((id) => visible2.has(id));
            if (targets.length > 0) {
              fitView({
                nodes: targets.map((id) => ({ id })),
                padding: 0.22,
                duration: 400,
                maxZoom: 1.2,
                minZoom: 0.12,
              });
              return;
            }
          }
          fitView({
            padding: 0.18,
            duration: 400,
            maxZoom: 1.2,
            minZoom: 0.12,
          });
        });
        return;
      }
      rawLayoutSkipFilterKeyRef.current = null;
    }

    const { outAdj: oa, inAdj: ia } = buildEdgeAdjacency(curEdges);
    const vuln = computeVulnChain(curNodes, ia, filter);
    const visible = computeVisibleIds(
      curNodes,
      { outAdj: oa, inAdj: ia },
      filter,
      vuln,
    );
    if (visible.size === 0) return;

    const allVisible = visible.size === curNodes.length;
    let cancelled = false;

    const runFitViewAfterLayout = () => {
      const pending = pendingFollowNewNodeIdsRef.current;
      pendingFollowNewNodeIdsRef.current = null;
      if (pending && pending.length > 0 && followLatestNodeRef.current) {
        const liveNodes = nodesRef.current;
        const liveEdges = edgesRef.current;
        const { outAdj: oa2, inAdj: ia2 } = buildEdgeAdjacency(liveEdges);
        const vuln2 = computeVulnChain(liveNodes, ia2, filter);
        const visible2 = computeVisibleIds(
          liveNodes,
          { outAdj: oa2, inAdj: ia2 },
          filter,
          vuln2,
        );
        const targets = pending.filter((id) => visible2.has(id));
        if (targets.length > 0) {
          fitView({
            nodes: targets.map((id) => ({ id })),
            padding: 0.22,
            duration: 400,
            maxZoom: 1.2,
            minZoom: 0.12,
          });
          return;
        }
      }
      const visibleNodeIds = [...visible].map((id) => ({ id }));
      fitView({
        ...(visibleNodeIds.length > 0 && visibleNodeIds.length < curNodes.length
          ? { nodes: visibleNodeIds }
          : {}),
        padding: 0.18,
        duration: 400,
        maxZoom: 1.2,
        minZoom: 0.12,
      });
    };

    void (async () => {
      try {
        const prevById = new Map(curNodes.map((n) => [n.id, n] as const));
        const userPos = userPositionedIdsRef.current;

        if (allVisible) {
          const laid = await layoutGraph(curNodes, curEdges);
          if (cancelled) return;
          const merged = laid.nodes.map((n) => {
            const prev = prevById.get(n.id);
            if (!prev) return n;
            const position = userPos.has(n.id) ? prev.position : n.position;
            return { ...prev, ...n, position, selected: prev.selected };
          });
          setNodes(merged);
        } else {
          const subNodes = curNodes.filter((n) => visible.has(n.id));
          const subEdges = curEdges.filter(
            (e) => visible.has(e.source) && visible.has(e.target),
          );
          const laid = await layoutGraph(subNodes, subEdges);
          if (cancelled) return;
          const pos = new Map(laid.nodes.map((n) => [n.id, n.position]));
          setNodes((prev) =>
            prev.map((n) => {
              if (!visible.has(n.id)) return n;
              if (userPos.has(n.id)) return n;
              const p = pos.get(n.id);
              if (p) return { ...n, position: p };
              return n;
            }),
          );
        }
        requestAnimationFrame(runFitViewAfterLayout);
      } catch {
        /* ELK 失败时保持当前坐标，仍尝试适配视口 */
        requestAnimationFrame(runFitViewAfterLayout);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filterRelayoutKey, filter, fitView, setNodes]);

  // 当选中的节点被「过滤」隐藏时清空选中 —— 注意只在过滤态改变后判定，
  // 数据刷新导致 visibleIds 引用变更但内容不变时不会触发清除。
  useEffect(() => {
    if (!selectedId) return;
    if (!visibleIds.has(selectedId)) {
      setSelectedId(null);
    }
    // 仅依赖 selectedId / filter；nodes 内容变化由上面那个「不存在则清除」副作用兜底
  }, [selectedId, filter, visibleIds]);

  const counts = useMemo(
    () => ({
      nodes: nodes.length,
      edges: edges.length,
      visibleNodes: visibleIds.size,
    }),
    [nodes.length, edges.length, visibleIds.size],
  );

  const safeAnalysisNodeIds = useMemo(() => {
    const s = new Set<string>();
    for (const n of nodes) {
      if (n.data.label !== 'AnalysisResult') continue;
      if (
        isAnalysisSafeVerdict((n.data.raw ?? {}) as Record<string, unknown>)
      ) {
        s.add(n.id);
      }
    }
    return s;
  }, [nodes]);

  const displayNodes = useMemo<AuditFlowNode[]>(() => {
    return nodes.map((n) => {
      const visible = visibleIds.has(n.id);
      return {
        ...n,
        hidden: !visible,
        draggable: visible,
        data: {
          ...n.data,
          highlighted: focusedIds ? focusedIds.has(n.id) : false,
          dimmed: focusedIds ? !focusedIds.has(n.id) : false,
        },
      };
    });
  }, [nodes, focusedIds, visibleIds]);

  const displayEdges = useMemo<AuditFlowEdge[]>(() => {
    return edges.map((e) => {
      const edgeVisible = visibleIds.has(e.source) && visibleIds.has(e.target);
      const inChain = focusedIds
        ? focusedIds.has(e.source) && focusedIds.has(e.target)
        : false;
      const touchesSafe =
        safeAnalysisNodeIds.has(e.source) || safeAnalysisNodeIds.has(e.target);
      const strokeOverride = touchesSafe ? ANALYSIS_SAFE_EDGE_COLOR : undefined;
      const kind = (e.data?.kind ?? 'FLOW') as AuditFlowEdgeData['kind'];
      const data: AuditFlowEdgeData = {
        ...((e.data ?? { kind: 'FLOW' }) as AuditFlowEdgeData),
        highlighted: inChain,
        dimmed: focusedIds ? !inChain : false,
        strokeOverride,
      };
      return {
        ...e,
        hidden: !edgeVisible,
        zIndex: inChain ? 1000 : 0,
        data,
      };
    });
  }, [edges, focusedIds, visibleIds, safeAnalysisNodeIds]);

  /** 仅把可见节点/边交给 React Flow，减少平移/缩放时的渲染负担 */
  const flowNodes = useMemo(
    () => displayNodes.filter((n) => !n.hidden),
    [displayNodes],
  );
  const flowEdges = useMemo(
    () => displayEdges.filter((e) => !e.hidden),
    [displayEdges],
  );

  const selectedData = useMemo<AuditFlowNodeData | null>(
    () =>
      selectedId
        ? (nodes.find((n) => n.id === selectedId)?.data ?? null)
        : null,
    [nodes, selectedId],
  );

  const connectedAuditInfos = useMemo<ConnectedAuditInfo[]>(() => {
    if (!selectedId || !selectedData) return [];
    const label = selectedData.label;
    if (
      label !== 'Knowledge' &&
      label !== 'ChainNode' &&
      label !== 'SinkFlowNode'
    ) {
      return [];
    }
    return findConnectedAuditInfos(raw, selectedId);
  }, [raw, selectedId, selectedData]);

  return (
    <div
      className={isPanning ? 'audit-chain-viewport-panning' : undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f9fafb',
      }}
    >
      {isEmpty ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Empty description="暂无审计链路图数据" />
        </div>
      ) : (
        <ReactFlow<AuditFlowNode, AuditFlowEdge>
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedId(null)}
          onMoveStart={() => setIsPanning(true)}
          onMoveEnd={() => setIsPanning(false)}
          nodesDraggable
          nodesConnectable={false}
          panOnDrag
          selectionOnDrag={false}
          elementsSelectable
          edgesFocusable={false}
          elevateNodesOnSelect={false}
          onlyRenderVisibleElements
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'audit' }}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 1.2 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#d1d9e0"
          />
          <Controls
            position="bottom-right"
            showInteractive={false}
            style={{ marginRight: 12, marginBottom: 12 }}
          />
          <MiniMap
            position="top-right"
            pannable
            zoomable
            style={{
              marginRight: 12,
              marginTop: 72,
              height: 96,
              width: 160,
            }}
            maskColor="rgba(247, 250, 252, 0.75)"
            nodeColor={miniMapNodeColor}
            nodeStrokeWidth={3}
            nodeBorderRadius={6}
          />
        </ReactFlow>
      )}

      <Header
        taskName={taskName}
        nodeCount={counts.nodes}
        edgeCount={counts.edges}
        visibleNodeCount={counts.visibleNodes}
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleReset}
        onRestoreLayout={handleRestoreAutoLayout}
        restoreLayoutLoading={relayouting}
        loading={layouting && counts.nodes === 0}
        followLatestNode={followLatestNode}
        onFollowLatestNodeChange={setFollowLatestNode}
        headerExtraRight={headerExtraRight}
        showFilterAndFollowLatest={showFilterAndFollowLatest}
      />

      <Legend />

      <NodeDetailPanel
        data={selectedData}
        elementId={selectedId}
        connectedAuditInfos={connectedAuditInfos}
        onClose={() => setSelectedId(null)}
      />

      {layouting || relayouting ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            background: 'rgba(249, 250, 251, 0.55)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow:
                '0 1px 2px 0 rgba(20, 27, 36, 0.06), 0 1px 3px 0 rgba(20, 27, 36, 0.10)',
            }}
          >
            <Spin size="small" />
            <span style={{ fontSize: 12, color: '#334155' }}>
              {relayouting ? '正在恢复自动布局…' : '正在构建审计链路图…'}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AuditChainInner;

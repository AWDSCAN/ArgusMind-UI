import { CloseOutlined } from '@ant-design/icons';
import { useLocation } from '@umijs/max';
import { Button, Spin, Tabs, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getVulnerabilityByNeo4jElementId,
  type VulnerabilityDetail,
} from '@/services/vulnerabilities';
import AuditInfoList from './AuditInfoList';
import { FALLBACK_STYLE, NODE_STYLE, STATUS_STYLE } from './constants';
import type { AuditFlowNodeData, ConnectedAuditInfo } from './types';

type Props = {
  data: AuditFlowNodeData | null;
  /** Neo4j elementId，与 React Flow 节点 id 一致 */
  elementId?: string | null;
  connectedAuditInfos?: ConnectedAuditInfo[];
  onClose: () => void;
};

const HIDDEN_KEYS = new Set(['task_id', 'node_id', 'branch_id']);

const PROP_DISPLAY_LABEL: Record<string, string> = {
  verdict: '判定',
  confidence: '可信度',
  verification_status: '核验',
  vul_name: '漏洞名称',
};

function formatPropKey(key: string, nodeLabel?: string): string {
  if (key === 'level') {
    if (nodeLabel === 'AnalysisResult') return '漏洞等级';
    return '优先级';
  }
  return PROP_DISPLAY_LABEL[key] ?? key;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function DetailField({ label, value }: { label: string; value: string }) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const isLong = trimmed.length > 60 || trimmed.includes('\n');
  return (
    <div style={{ marginBottom: 12 }}>
      <dt
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#64748b',
          marginBottom: 4,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          padding: '6px 10px',
          borderRadius: 6,
          background: '#f8fafc',
          color: '#0f172a',
          fontSize: 12,
          lineHeight: isLong ? 1.6 : 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {trimmed}
      </dd>
    </div>
  );
}

const VULN_DETAIL_PATH = /^\/vulnerabilities\/[^/]+$/;

function NodePropsSection({
  data,
  isAnalysisResult,
  findingLoading,
  finding,
  findingError,
}: {
  data: AuditFlowNodeData;
  isAnalysisResult: boolean;
  findingLoading: boolean;
  finding: VulnerabilityDetail | null;
  findingError: boolean;
}) {
  const entries = Object.entries(data.raw)
    .filter(
      ([k, v]) =>
        !HIDDEN_KEYS.has(k) && v !== '' && v !== null && v !== undefined,
    )
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      {isAnalysisResult && (findingLoading || finding || findingError) ? (
        <>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              display: 'block',
              marginBottom: 8,
            }}
          >
            漏洞详情
          </Typography.Text>
          {findingLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 12,
              }}
            >
              <Spin size="small" />
            </div>
          ) : finding ? (
            <dl style={{ margin: 0, marginBottom: 16 }}>
              <DetailField label="分析细节" value={finding.detailText} />
              <DetailField
                label="核验说明"
                value={finding.verificationReason}
              />
            </dl>
          ) : findingError ? (
            <Typography.Text
              type="secondary"
              italic
              style={{ fontSize: 12, display: 'block', marginBottom: 16 }}
            >
              无法加载漏洞详情
            </Typography.Text>
          ) : null}
        </>
      ) : null}

      <Typography.Text
        type="secondary"
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          display: 'block',
          marginBottom: 8,
        }}
      >
        属性
      </Typography.Text>
      {entries.length === 0 ? (
        <Typography.Text type="secondary" italic style={{ fontSize: 12 }}>
          无额外属性
        </Typography.Text>
      ) : (
        <dl style={{ margin: 0 }}>
          {entries.map(([key, value]) => {
            const isLong =
              typeof value === 'string' &&
              (value.length > 60 || value.includes('\n'));
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <dt
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#64748b',
                    marginBottom: 4,
                  }}
                >
                  {formatPropKey(key, data.label)}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: 12,
                    lineHeight: isLong ? 1.6 : 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: isLong
                      ? undefined
                      : 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  }}
                >
                  {formatValue(value)}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </>
  );
}

const NodeDetailPanel: React.FC<Props> = ({
  data,
  elementId,
  connectedAuditInfos = [],
  onClose,
}) => {
  const { pathname } = useLocation();
  const [findingLoading, setFindingLoading] = useState(false);
  const [finding, setFinding] = useState<VulnerabilityDetail | null>(null);
  const [findingError, setFindingError] = useState(false);
  const [detailTab, setDetailTab] = useState('node');

  const isAnalysisResult = data?.label === 'AnalysisResult';
  const neo4jElementId = (elementId ?? '').trim();
  const showVulnDetailLink = !VULN_DETAIL_PATH.test(pathname);

  const auditInfoCount = connectedAuditInfos.length;
  const useAuditTabs =
    data != null &&
    (data.label === 'ChainNode' || data.label === 'SinkFlowNode') &&
    auditInfoCount > 0;
  const knowledgeInlineAudit =
    data?.label === 'Knowledge' && auditInfoCount > 0;

  useEffect(() => {
    setDetailTab('node');
  }, [elementId]);

  useEffect(() => {
    if (!isAnalysisResult || !neo4jElementId) {
      setFinding(null);
      setFindingError(false);
      setFindingLoading(false);
      return;
    }

    let cancelled = false;
    setFindingLoading(true);
    setFindingError(false);
    setFinding(null);

    void (async () => {
      try {
        const res = await getVulnerabilityByNeo4jElementId(neo4jElementId);
        if (cancelled) return;
        if (res.success && res.data) {
          setFinding(res.data);
          setFindingError(false);
        } else {
          setFinding(null);
          setFindingError(true);
        }
      } catch {
        if (!cancelled) {
          setFinding(null);
          setFindingError(true);
        }
      } finally {
        if (!cancelled) {
          setFindingLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAnalysisResult, neo4jElementId]);

  const bodyContent = useMemo(() => {
    if (!data) return null;

    const eleidSection =
      neo4jElementId.length > 0 ? (
        <DetailField label="eleid" value={neo4jElementId} />
      ) : null;

    const nodePropsOnly = (
      <NodePropsSection
        data={data}
        isAnalysisResult={isAnalysisResult}
        findingLoading={findingLoading}
        finding={finding}
        findingError={findingError}
      />
    );

    const propsSection = (
      <>
        {eleidSection}
        {nodePropsOnly}
      </>
    );

    if (useAuditTabs) {
      return (
        <Tabs
          activeKey={detailTab}
          onChange={setDetailTab}
          size="small"
          destroyInactiveTabPane={false}
          items={[
            {
              key: 'node',
              label: '节点信息',
              children: propsSection,
            },
            {
              key: 'audit',
              label: `审计信息 (${auditInfoCount})`,
              children: <AuditInfoList items={connectedAuditInfos} />,
            },
          ]}
        />
      );
    }

    if (knowledgeInlineAudit) {
      const entries = Object.entries(data.raw).filter(
        ([k, v]) =>
          !HIDDEN_KEYS.has(k) && v !== '' && v !== null && v !== undefined,
      );
      return (
        <>
          {eleidSection}
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              display: 'block',
              marginBottom: 8,
            }}
          >
            审计信息 ({auditInfoCount})
          </Typography.Text>
          <AuditInfoList items={connectedAuditInfos} />
          {entries.length > 0 ? (
            <div style={{ marginTop: 16 }}>{nodePropsOnly}</div>
          ) : null}
        </>
      );
    }

    return propsSection;
  }, [
    data,
    neo4jElementId,
    useAuditTabs,
    knowledgeInlineAudit,
    detailTab,
    auditInfoCount,
    connectedAuditInfos,
    isAnalysisResult,
    findingLoading,
    finding,
    findingError,
    showVulnDetailLink,
  ]);

  if (!data) return null;

  const style = NODE_STYLE[data.label] ?? FALLBACK_STYLE;
  const Icon = style.Icon;
  const status = data.status ? STATUS_STYLE[data.status] : null;

  return (
    <aside
      style={{
        position: 'absolute',
        top: 76,
        right: 12,
        bottom: 12,
        zIndex: 20,
        width: 360,
        maxWidth: 'calc(100% - 24px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 12px 32px -4px rgba(20, 27, 36, 0.15)',
        pointerEvents: 'auto',
        minHeight: 0,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          borderBottom: '1px solid #f1f5f9',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            background: style.iconBg,
            flex: '0 0 auto',
          }}
        >
          <Icon style={{ color: style.iconColor, fontSize: 18 }} />
        </div>
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div
            title={data.title}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{style.label}</span>
            {status ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: status.text,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: status.dot,
                  }}
                />
                {status.label}
              </span>
            ) : null}
            {auditInfoCount > 0 &&
            (data.label === 'Knowledge' ||
              data.label === 'ChainNode' ||
              data.label === 'SinkFlowNode') ? (
              <span style={{ color: '#0284c7' }}>
                {auditInfoCount} 条审计信息
              </span>
            ) : null}
          </div>
        </div>
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          aria-label="关闭详情"
        />
      </header>

      {data.subtitle ? (
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            flex: '0 0 auto',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#0f172a',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              wordBreak: 'break-all',
            }}
          >
            {data.subtitle}
          </div>
        </div>
      ) : null}

      {isAnalysisResult && showVulnDetailLink ? (
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #f1f5f9',
            flex: '0 0 auto',
          }}
        >
          {findingLoading ? (
            <div
              style={{ display: 'flex', justifyContent: 'center', padding: 4 }}
            >
              <Spin size="small" />
            </div>
          ) : finding ? (
            <Button
              type="primary"
              size="small"
              block
              onClick={() => {
                window.open(
                  `/vulnerabilities/${finding.id}`,
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
            >
              查看漏洞详情
            </Button>
          ) : findingError ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              未找到关联漏洞记录
            </Typography.Text>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          padding: '12px 14px',
        }}
        className="audit-chain-detail-scroll"
      >
        {bodyContent}
      </div>
    </aside>
  );
};

export default NodeDetailPanel;

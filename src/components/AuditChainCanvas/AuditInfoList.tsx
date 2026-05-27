import { Typography } from 'antd';
import React from 'react';
import { NODE_STYLE } from './constants';
import type { ConnectedAuditInfo } from './types';

const HIDDEN_KEYS = new Set(['task_id', 'node_id', 'branch_id']);

const AUDIT_INFO_PROP_LABEL: Record<string, string> = {
  title: '标题',
  summary: '摘要',
  name: '名称',
  message: '内容',
  content: '内容',
  body: '正文',
  detail: '详情',
  description: '描述',
  kind: '类型',
  info_type: '类型',
  category: '分类',
  source: '来源',
  origin: '来源',
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function auditInfoFields(
  info: ConnectedAuditInfo,
): Array<{ key: string; label: string; value: string }> {
  const priority = [
    'message',
    'content',
    'summary',
    'description',
    'detail',
    'body',
    'title',
    'name',
    'kind',
    'info_type',
    'category',
    'source',
    'origin',
  ];
  const used = new Set<string>();
  const rows: Array<{ key: string; label: string; value: string }> = [];

  for (const key of priority) {
    const v = info.props[key];
    if (v === '' || v === null || v === undefined) continue;
    const text = formatValue(v).trim();
    if (!text) continue;
    used.add(key);
    rows.push({
      key,
      label: AUDIT_INFO_PROP_LABEL[key] ?? key,
      value: text,
    });
  }

  for (const [key, value] of Object.entries(info.props)) {
    if (HIDDEN_KEYS.has(key) || used.has(key)) continue;
    if (value === '' || value === null || value === undefined) continue;
    const text = formatValue(value).trim();
    if (!text) continue;
    rows.push({
      key,
      label: AUDIT_INFO_PROP_LABEL[key] ?? key,
      value: text,
    });
  }

  return rows;
}

const auditStyle = NODE_STYLE.AuditInfo;
const AuditIcon = auditStyle.Icon;

type Props = {
  items: ConnectedAuditInfo[];
};

const AuditInfoList: React.FC<Props> = ({ items }) => {
  if (items.length === 0) {
    return (
      <Typography.Text type="secondary" italic style={{ fontSize: 12 }}>
        无关联审计信息
      </Typography.Text>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((info, index) => {
        const fields = auditInfoFields(info);
        return (
          <article
            key={info.elementId}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#f8fafc',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                borderBottom:
                  fields.length > 0 ? '1px solid #e2e8f0' : undefined,
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  background: auditStyle.iconBg,
                  flex: '0 0 auto',
                }}
              >
                <AuditIcon
                  style={{ color: auditStyle.iconColor, fontSize: 14 }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0f172a',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {info.title}
                </div>
                {info.subtitle ? (
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: '#64748b',
                    }}
                  >
                    {info.subtitle}
                  </div>
                ) : null}
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    color: '#94a3b8',
                  }}
                >
                  #{index + 1}
                </div>
              </div>
            </div>
            {fields.length > 0 ? (
              <dl style={{ margin: 0, padding: '10px 12px' }}>
                {fields.map(({ key, label, value }) => {
                  const isLong = value.length > 80 || value.includes('\n');
                  return (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <dt
                        style={{
                          fontSize: 11,
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
                          fontSize: 12,
                          color: '#0f172a',
                          lineHeight: isLong ? 1.6 : 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};

export default AuditInfoList;

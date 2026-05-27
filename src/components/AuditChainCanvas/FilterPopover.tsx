import { CheckOutlined, FilterOutlined } from '@ant-design/icons';
import { Badge, Button, Popover, Space, Typography } from 'antd';
import React from 'react';

export type StatusFilter = 'running' | 'completed' | 'pending';
export type VerdictFilter =
  | 'LIKELY_VULNERABLE'
  | 'POSSIBLY_VULNERABLE'
  | 'SAFE';
export type VerificationFilter = 'CONFIRMED' | 'REJECTED';

export type FilterState = {
  status: ReadonlySet<StatusFilter>;
  verdict: ReadonlySet<VerdictFilter>;
  verification: ReadonlySet<VerificationFilter>;
};

export const EMPTY_FILTER: FilterState = {
  status: new Set(),
  verdict: new Set(),
  verification: new Set(),
};

/** 审计链路图筛选初始值（每次调用新 Set，避免切换任务时 setState 被合并跳过） */
export function createAuditChainDefaultFilter(): FilterState {
  return {
    status: new Set<StatusFilter>(['running', 'completed']),
    verdict: new Set<VerdictFilter>([
      'LIKELY_VULNERABLE',
      'POSSIBLY_VULNERABLE',
    ]),
    verification: new Set(),
  };
}

type Option<T extends string> = {
  value: T;
  label: string;
  dot?: string;
  activeBg?: string;
  activeColor?: string;
  activeBorder?: string;
};

const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { value: 'running', label: '执行中', dot: '#3b82f6' },
  { value: 'completed', label: '已完成', dot: '#10b981' },
  { value: 'pending', label: '等待中', dot: '#cbd5e1' },
];

const VERDICT_OPTIONS: Option<VerdictFilter>[] = [
  {
    value: 'LIKELY_VULNERABLE',
    label: 'LIKELY_VULNERABLE',
    activeBg: '#fff1f2',
    activeColor: '#b91c1c',
    activeBorder: '#fda4af',
  },
  {
    value: 'POSSIBLY_VULNERABLE',
    label: 'POSSIBLY_VULNERABLE',
    activeBg: '#fffbeb',
    activeColor: '#b45309',
    activeBorder: '#fcd34d',
  },
  {
    value: 'SAFE',
    label: 'SAFE',
    activeBg: '#ecfdf5',
    activeColor: '#047857',
    activeBorder: '#6ee7b7',
  },
];

const VERIFICATION_OPTIONS: Option<VerificationFilter>[] = [
  {
    value: 'CONFIRMED',
    label: 'CONFIRMED',
    activeBg: '#fff1f2',
    activeColor: '#b91c1c',
    activeBorder: '#fda4af',
  },
  {
    value: 'REJECTED',
    label: 'REJECTED',
    activeBg: '#f1f5f9',
    activeColor: '#475569',
    activeBorder: '#cbd5e1',
  },
];

function toggleItem<T>(set: ReadonlySet<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
};

const FilterPopover: React.FC<Props> = ({ value, onChange }) => {
  const total =
    value.status.size + value.verdict.size + value.verification.size;
  const active = total > 0;

  const content = (
    <div style={{ width: 360 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Typography.Text strong style={{ fontSize: 13 }}>
          过滤条件
        </Typography.Text>
        {active ? (
          <Button
            size="small"
            type="link"
            onClick={() => onChange(EMPTY_FILTER)}
          >
            清空全部
          </Button>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            未选 = 不过滤
          </Typography.Text>
        )}
      </div>

      <FilterGroup
        title="节点状态"
        hint="审计任务 · 审计阶段 始终显示"
        options={STATUS_OPTIONS}
        selected={value.status}
        onToggle={(v) =>
          onChange({ ...value, status: toggleItem(value.status, v) })
        }
      />

      <FilterGroup
        title="漏洞结论 (verdict)"
        hint="作用于漏洞链路，优先级高于状态过滤"
        options={VERDICT_OPTIONS}
        selected={value.verdict}
        onToggle={(v) =>
          onChange({ ...value, verdict: toggleItem(value.verdict, v) })
        }
      />

      <FilterGroup
        title="验证状态 (verification_status)"
        hint="作用于漏洞链路，优先级高于状态过滤"
        options={VERIFICATION_OPTIONS}
        selected={value.verification}
        onToggle={(v) =>
          onChange({
            ...value,
            verification: toggleItem(value.verification, v),
          })
        }
      />
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      content={content}
      destroyOnHidden
    >
      <Button
        size="small"
        type={active ? 'primary' : 'default'}
        icon={<FilterOutlined />}
      >
        <Space size={4}>
          过滤
          {active ? (
            <Badge count={total} size="small" overflowCount={99} />
          ) : null}
        </Space>
      </Button>
    </Popover>
  );
};

type FilterGroupProps<T extends string> = {
  title: string;
  hint?: string;
  options: ReadonlyArray<Option<T>>;
  selected: ReadonlySet<T>;
  onToggle: (v: T) => void;
};

function FilterGroup<T extends string>({
  title,
  hint,
  options,
  selected,
  onToggle,
}: FilterGroupProps<T>) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: '#64748b',
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      {hint ? (
        <div
          style={{
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          {hint}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((opt) => {
          const isOn = selected.has(opt.value);
          const onStyle: React.CSSProperties = {
            background: opt.activeBg ?? '#eff6ff',
            color: opt.activeColor ?? '#1d4ed8',
            borderColor: opt.activeBorder ?? '#93c5fd',
          };
          const offStyle: React.CSSProperties = {
            background: '#ffffff',
            color: '#475569',
            borderColor: '#e2e8f0',
          };
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                border: '1px solid',
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease',
                ...(isOn ? onStyle : offStyle),
              }}
            >
              {isOn ? (
                <CheckOutlined style={{ fontSize: 10 }} />
              ) : opt.dot ? (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: opt.dot,
                  }}
                />
              ) : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterPopover;

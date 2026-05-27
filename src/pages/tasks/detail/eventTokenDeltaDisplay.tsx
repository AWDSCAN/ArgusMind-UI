import { Tooltip, Typography } from 'antd';
import React from 'react';
import type { AuditSessionDetailDTO } from '@/types/auditSessionDetail';

export type EventTokenDeltaFields = Pick<
  AuditSessionDetailDTO['events'][number],
  | 'llmInputDelta'
  | 'llmOutputDelta'
  | 'codeAgentInputDelta'
  | 'codeAgentOutputDelta'
>;

type TokenDeltaGroup = {
  label: string;
  tooltipLabel: string;
  input: number;
  output: number;
};

function hasPositiveToken(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

function formatInOut(input: number, output: number): string {
  return `${input.toLocaleString()}/${output.toLocaleString()}`;
}

function buildTokenDeltaGroups(
  event: EventTokenDeltaFields,
): TokenDeltaGroup[] {
  const groups: TokenDeltaGroup[] = [];
  const llmIn = event.llmInputDelta ?? 0;
  const llmOut = event.llmOutputDelta ?? 0;
  if (hasPositiveToken(llmIn) || hasPositiveToken(llmOut)) {
    groups.push({
      label: 'LLM',
      tooltipLabel: '主模型',
      input: llmIn,
      output: llmOut,
    });
  }
  const caIn = event.codeAgentInputDelta ?? 0;
  const caOut = event.codeAgentOutputDelta ?? 0;
  if (hasPositiveToken(caIn) || hasPositiveToken(caOut)) {
    groups.push({
      label: 'CA',
      tooltipLabel: 'Code Agent',
      input: caIn,
      output: caOut,
    });
  }
  return groups;
}

export const EventTokenDeltaInline: React.FC<{
  event: EventTokenDeltaFields;
}> = ({ event }) => {
  const groups = buildTokenDeltaGroups(event);
  if (!groups.length) return null;

  const tooltip = groups
    .map(
      (g) =>
        `${g.tooltipLabel} Token：输入 ${g.input.toLocaleString()} / 输出 ${g.output.toLocaleString()}`,
    )
    .join('\n');

  const content = (
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {groups.map((g, i) => (
        <React.Fragment key={g.label}>
          {i > 0 ? (
            <span style={{ marginInline: 4, opacity: 0.45 }}>·</span>
          ) : null}
          <span>
            {g.label} {formatInOut(g.input, g.output)}
          </span>
        </React.Fragment>
      ))}
    </Typography.Text>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};

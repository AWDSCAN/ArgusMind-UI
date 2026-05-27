import {
  BulbOutlined,
  CheckSquareOutlined,
  CodeOutlined,
  ConsoleSqlOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LoadingOutlined,
  RightOutlined,
  RobotOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Empty, theme } from 'antd';
import React, { useState } from 'react';
import type {
  MergedOpencodePart,
  OpencodeStreamItem,
} from '@/utils/opencodeEventsMerge';
import {
  basenamePath,
  buildContextToolTrigger,
  buildOpencodeDisplaySegments,
  dirnamePath,
  extractTodos,
  formatStandaloneToolHeadline,
  getToolFromMergedPart,
  isToolPending,
  type OpencodeDisplaySegment,
  summarizeContextToolGroup,
} from '@/utils/opencodeToolPresentation';
import { OPENCODE_SCROLL_CLASS } from './detailStyles';

type OpencodeThemeToken = ReturnType<typeof theme.useToken>['token'];

const TOOL_ICON_STYLE: React.CSSProperties = {
  fontSize: 14,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
};

function ToolIcon({ tool }: { tool: string }) {
  const style = TOOL_ICON_STYLE;
  switch (tool) {
    case 'read':
      return <FileTextOutlined style={style} />;
    case 'list':
      return <UnorderedListOutlined style={style} />;
    case 'glob':
    case 'grep':
      return <FileSearchOutlined style={style} />;
    case 'webfetch':
      return <GlobalOutlined style={style} />;
    case 'websearch':
    case 'codesearch':
      return <SearchOutlined style={style} />;
    case 'bash':
      return <ConsoleSqlOutlined style={style} />;
    case 'edit':
      return <EditOutlined style={style} />;
    case 'write':
      return <FileAddOutlined style={style} />;
    case 'apply_patch':
      return <CodeOutlined style={style} />;
    case 'task':
      return <RobotOutlined style={style} />;
    case 'todowrite':
      return <CheckSquareOutlined style={style} />;
    case 'skill':
      return <ThunderboltOutlined style={style} />;
    default:
      return <ToolOutlined style={style} />;
  }
}

/** 顶层折叠条（对齐 opencode tool-trigger 视觉，紧凑无背景色） */
const ToolTriggerRow: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  args?: string[];
  pending?: boolean;
  expandable?: boolean;
  open?: boolean;
  onToggle?: () => void;
  token: OpencodeThemeToken;
}> = ({
  icon,
  title,
  subtitle,
  args,
  pending,
  expandable,
  open,
  onToggle,
  token,
}) => {
  /** 是否在运行中仍允许展开：由子组件用 expandable 表达「是否有可展示内容」 */
  const interactive = Boolean(expandable && onToggle);
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : -1}
      onClick={interactive ? onToggle : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.();
              }
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 24,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        color: token.colorText,
        fontSize: token.fontSize,
        lineHeight: token.lineHeightLG,
      }}
    >
      <span style={{ color: token.colorTextTertiary, display: 'inline-flex' }}>
        {pending ? <LoadingOutlined style={TOOL_ICON_STYLE} spin /> : icon}
      </span>
      <span
        style={{
          fontWeight: 500,
          color: pending ? token.colorTextSecondary : token.colorText,
          textTransform: 'capitalize',
          flexShrink: 0,
        }}
      >
        {title}
      </span>
      {subtitle ? (
        <span
          style={{
            color: token.colorTextSecondary,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </span>
      ) : null}
      {args?.length ? (
        <span
          style={{
            color: token.colorTextTertiary,
            fontSize: token.fontSizeSM,
            display: 'inline-flex',
            gap: 8,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {args.map((a) => (
            <span
              key={a}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {a}
            </span>
          ))}
        </span>
      ) : null}
      {expandable ? (
        <RightOutlined
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: token.colorTextTertiary,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      ) : null}
    </div>
  );
};

/** 终端式输出块（bash / 命令输出） */
const TerminalBlock: React.FC<{
  text: string;
  token: OpencodeThemeToken;
  maxHeight?: number;
}> = ({ text, token, maxHeight = 240 }) => (
  <div
    className={OPENCODE_SCROLL_CLASS}
    style={{
      marginTop: 8,
      width: '100%',
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadius,
      background: token.colorBgContainer,
      maxHeight,
      overflow: 'auto',
    }}
  >
    <pre
      style={{
        margin: 0,
        padding: 12,
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        fontSize: 12.5,
        lineHeight: token.lineHeightLG,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: token.colorText,
      }}
    >
      <code>{text}</code>
    </pre>
  </div>
);

const InlineMonoBlock: React.FC<{
  text: string;
  token: OpencodeThemeToken;
  maxHeight?: number;
}> = ({ text, token, maxHeight = 200 }) => (
  <div
    className={OPENCODE_SCROLL_CLASS}
    style={{
      marginTop: 8,
      width: '100%',
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadius,
      background: token.colorFillQuaternary,
      maxHeight,
      overflow: 'auto',
    }}
  >
    <pre
      style={{
        margin: 0,
        padding: 10,
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        fontSize: 12.5,
        lineHeight: token.lineHeightLG,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: token.colorText,
      }}
    >
      <code>{text}</code>
    </pre>
  </div>
);

/** 上下文工具分组：连续的 read/glob/grep/list 折叠成一条「已探索 …」 */
const ContextToolGroupBlock: React.FC<{
  parts: MergedOpencodePart[];
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ parts, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const busy = parts.some((p) => isToolPending(p));
  const summary = summarizeContextToolGroup(parts, busy);

  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ExperimentOutlined style={TOOL_ICON_STYLE} />}
        title={summary.primary}
        subtitle={summary.secondary}
        pending={busy}
        expandable
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open ? (
        <div
          style={{
            marginTop: 6,
            paddingLeft: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {parts.map((p) => {
            const trigger = buildContextToolTrigger(p);
            const { tool } = getToolFromMergedPart(p);
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: token.fontSize,
                  color: token.colorText,
                  minWidth: 0,
                }}
              >
                <span style={{ color: token.colorTextTertiary }}>
                  <ToolIcon tool={tool} />
                </span>
                <span style={{ fontWeight: 500 }}>{trigger.title}</span>
                {trigger.subtitle ? (
                  <span
                    style={{
                      color: token.colorTextSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {trigger.subtitle}
                  </span>
                ) : null}
                {trigger.args?.length ? (
                  <span
                    style={{
                      color: token.colorTextTertiary,
                      fontSize: token.fontSizeSM,
                      display: 'inline-flex',
                      gap: 6,
                    }}
                  >
                    {trigger.args.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** Bash 工具：固定终端输出样式（$ command\n\noutput） */
const BashToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const { input, output } = getToolFromMergedPart(part);
  const description =
    typeof input.description === 'string' ? input.description : '';
  const command = typeof input.command === 'string' ? input.command : '';
  const out = output ?? '';
  const text = `$ ${command}${out ? `\n\n${out}` : ''}`;
  const pending = isToolPending(part);

  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ConsoleSqlOutlined style={TOOL_ICON_STYLE} />}
        title="Shell"
        subtitle={description || command}
        pending={pending}
        expandable={Boolean(command || description)}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open ? <TerminalBlock text={text} token={token} /> : null}
    </div>
  );
};

/** Edit / Write / Apply Patch */
const FileToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const { tool, input } = getToolFromMergedPart(part);
  const filePath =
    typeof input.filePath === 'string'
      ? input.filePath
      : typeof input.path === 'string'
        ? input.path
        : '';
  const filename = basenamePath(filePath);
  const directory = dirnamePath(filePath);
  const pending = isToolPending(part);
  const headline = formatStandaloneToolHeadline(part);

  const body = (() => {
    if (tool === 'write') {
      const content = typeof input.content === 'string' ? input.content : '';
      return content;
    }
    if (tool === 'edit') {
      const oldS = typeof input.oldString === 'string' ? input.oldString : '';
      const newS = typeof input.newString === 'string' ? input.newString : '';
      if (!oldS && !newS) return '';
      return `--- old\n${oldS}\n--- new\n${newS}`;
    }
    return '';
  })();

  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ToolIcon tool={tool} />}
        title={headline.primary}
        subtitle={
          filename ? (
            <span style={{ display: 'inline-flex', gap: 6, minWidth: 0 }}>
              <span style={{ color: token.colorText }}>{filename}</span>
              {directory ? (
                <span
                  style={{
                    color: token.colorTextTertiary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    direction: 'rtl',
                  }}
                >
                  {directory}
                </span>
              ) : null}
            </span>
          ) : (
            headline.secondary
          )
        }
        pending={pending}
        expandable={Boolean(body)}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && body ? <InlineMonoBlock text={body} token={token} /> : null}
    </div>
  );
};

/** Webfetch / WebSearch / Code Search */
const SearchLikeToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const { tool, input, output } = getToolFromMergedPart(part);
  const headline = formatStandaloneToolHeadline(part);
  const pending = isToolPending(part);
  const url = typeof input.url === 'string' ? input.url : '';

  if (tool === 'webfetch' && url) {
    return (
      <div style={{ width: '100%', marginTop }}>
        <ToolTriggerRow
          token={token}
          icon={<ToolIcon tool="webfetch" />}
          title="Fetch"
          subtitle={
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: token.colorLink }}
            >
              {url}
            </a>
          }
          pending={pending}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ToolIcon tool={tool} />}
        title={headline.primary}
        subtitle={headline.secondary}
        pending={pending}
        expandable={!pending && Boolean(output)}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && output ? <InlineMonoBlock text={output} token={token} /> : null}
    </div>
  );
};

const TaskToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const headline = formatStandaloneToolHeadline(part);
  const pending = isToolPending(part);
  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ToolIcon tool="task" />}
        title={headline.primary}
        subtitle={headline.secondary}
        pending={pending}
      />
    </div>
  );
};

const TodoToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const todos = extractTodos(part);
  if (!todos.length) return null;
  const completed = todos.filter((t) => t.status === 'completed').length;
  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ToolIcon tool="todowrite" />}
        title="Todos"
        subtitle={`${completed}/${todos.length}`}
      />
      <div
        style={{
          marginTop: 6,
          paddingLeft: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {todos.map((t) => (
          <div
            key={`${t.status}:${t.content}`}
            style={{
              fontSize: token.fontSize,
              color:
                t.status === 'completed'
                  ? token.colorTextTertiary
                  : token.colorText,
              textDecoration:
                t.status === 'completed' ? 'line-through' : 'none',
            }}
          >
            <span style={{ marginRight: 8 }}>
              {t.status === 'completed' ? '☑' : '☐'}
            </span>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
};

/** 通用单工具回退：标题 + 副标题，可展开 output（无 JSON） */
const GenericToolBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const { tool, output, error } = getToolFromMergedPart(part);
  const headline = formatStandaloneToolHeadline(part);
  const pending = isToolPending(part);
  const detail = error || output || '';
  return (
    <div style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<ToolIcon tool={tool} />}
        title={headline.primary}
        subtitle={headline.secondary}
        pending={pending}
        expandable={!pending && Boolean(detail)}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && detail ? <InlineMonoBlock text={detail} token={token} /> : null}
    </div>
  );
};

/** session.status retry：红色事件提醒 */
const RetryAlertBlock: React.FC<{
  content: string;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ content, token, marginTop }) => (
  <div
    data-opencode-part="retry"
    style={{
      width: '100%',
      marginTop,
      padding: token.paddingSM,
      borderRadius: token.borderRadius,
      border: `1px solid ${token.colorErrorBorder}`,
      background: token.colorErrorBg,
      color: token.colorErrorText,
      fontSize: token.fontSize,
      lineHeight: token.lineHeightLG,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <ExclamationCircleOutlined
        style={{ fontSize: 14, marginTop: 3, flexShrink: 0 }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>重试</div>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: token.fontFamily,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  </div>
);

/** 助手正文 text part */
const TextBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const body = (part.text ?? part.content ?? '').trim();
  if (!body) return null;
  return (
    <div
      data-opencode-part="text"
      style={{
        width: '100%',
        marginTop,
        color: token.colorText,
        fontSize: token.fontSize,
        lineHeight: token.lineHeightLG,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: token.fontFamily,
      }}
    >
      {body}
    </div>
  );
};

/** reasoning：与「已探索」同款可折叠行，默认收起 */
const ReasoningBlock: React.FC<{
  part: MergedOpencodePart;
  token: OpencodeThemeToken;
  marginTop: number;
}> = ({ part, token, marginTop }) => {
  const [open, setOpen] = useState(false);
  const body = (part.text ?? part.content ?? '').trim();
  if (!body) return null;

  const firstLine = body.split(/\r?\n/).find((l) => l.trim()) ?? body;
  const preview =
    firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : firstLine;

  return (
    <div data-opencode-part="reasoning" style={{ width: '100%', marginTop }}>
      <ToolTriggerRow
        token={token}
        icon={<BulbOutlined style={TOOL_ICON_STYLE} />}
        title="思考"
        subtitle={open ? undefined : preview}
        expandable
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open ? (
        <div
          className={OPENCODE_SCROLL_CLASS}
          style={{
            marginTop: 8,
            marginLeft: 22,
            padding: token.paddingSM,
            maxHeight: 320,
            overflowY: 'auto',
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorFillQuaternary,
            color: token.colorTextSecondary,
            fontSize: token.fontSize,
            lineHeight: token.lineHeightLG,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: token.fontFamily,
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
};

const OpencodeSegmentBlock: React.FC<{
  segment: OpencodeDisplaySegment;
  token: OpencodeThemeToken;
  isFirst: boolean;
}> = ({ segment, token, isFirst }) => {
  /** 与 opencode assistant-message 的 gap≈12px 对齐，避免段与段之间过大留白 */
  const mt = isFirst ? 0 : token.marginSM;
  switch (segment.kind) {
    case 'text':
      return <TextBlock part={segment.part} token={token} marginTop={mt} />;
    case 'reasoning':
      return (
        <ReasoningBlock part={segment.part} token={token} marginTop={mt} />
      );
    case 'context_tools':
      return (
        <ContextToolGroupBlock
          parts={segment.parts}
          token={token}
          marginTop={mt}
        />
      );
    case 'tool': {
      const { tool } = getToolFromMergedPart(segment.part);
      const props = { part: segment.part, token, marginTop: mt };
      switch (tool) {
        case 'bash':
          return <BashToolBlock {...props} />;
        case 'edit':
        case 'write':
        case 'apply_patch':
          return <FileToolBlock {...props} />;
        case 'webfetch':
        case 'websearch':
        case 'codesearch':
          return <SearchLikeToolBlock {...props} />;
        case 'task':
          return <TaskToolBlock {...props} />;
        case 'todowrite':
          return <TodoToolBlock {...props} />;
        default:
          return <GenericToolBlock {...props} />;
      }
    }
    default:
      return null;
  }
};

export const OpencodeExecutionStream: React.FC<{
  items: OpencodeStreamItem[];
}> = ({ items }) => {
  const { token } = theme.useToken();

  if (!items.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无助手侧 OpenCode 事件"
      />
    );
  }

  return (
    <div
      data-opencode-stream="assistant"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: token.marginSM,
        width: '100%',
        userSelect: 'text',
      }}
    >
      {items.map((item, itemIdx) => {
        const isFirst = itemIdx === 0;

        if (item.kind === 'retry') {
          return (
            <RetryAlertBlock
              key={`retry-${item.id}`}
              content={item.content}
              token={token}
              marginTop={0}
            />
          );
        }

        const segments = buildOpencodeDisplaySegments(item.message.parts);
        if (!segments.length) return null;

        return (
          <div key={item.message.messageId} style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              {segments.map((seg, idx) => (
                <OpencodeSegmentBlock
                  key={
                    seg.kind === 'context_tools'
                      ? `ctx-${seg.parts[0]?.id ?? idx}`
                      : seg.part.id
                  }
                  segment={seg}
                  token={token}
                  isFirst={isFirst && idx === 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

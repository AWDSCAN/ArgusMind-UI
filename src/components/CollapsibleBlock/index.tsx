import { CopyOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import './markdown.less';

export type CollapsibleBlockProps = {
  /** 纯文本、Markdown 或 JSON 字符串 */
  content: string;
  maxLines?: number;
  language?: 'json' | 'plaintext' | 'markdown' | 'code';
  /** 超长内容时是否默认展开 */
  defaultExpanded?: boolean;
  className?: string;
};

function formatContent(
  raw: string,
  language: 'json' | 'plaintext' | 'markdown' | 'code',
): string {
  if (language !== 'json') return raw;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

const markdownPlugins = [remarkGfm];
const markdownRehypePlugins = [rehypeSanitize];

const markdownComponents: React.ComponentProps<
  typeof ReactMarkdown
>['components'] = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

/**
 * 长内容：默认折叠约 maxLines 行，支持展开/收起与复制。
 * language=markdown 时使用 GFM 完整渲染；language=code 时使用等宽代码块。
 */
const CollapsibleBlock: React.FC<CollapsibleBlockProps> = ({
  content,
  maxLines = 8,
  language = 'plaintext',
  defaultExpanded = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const formatted = useMemo(
    () => formatContent(content, language),
    [content, language],
  );
  const lines = formatted.split('\n');
  const needCollapse = lines.length > maxLines;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
    } catch {
      // ignore
    }
  };

  const collapseControls = (
    <Space style={{ marginBottom: 8 }}>
      {needCollapse && (
        <Button type="link" size="small" onClick={() => setExpanded((e) => !e)}>
          {expanded ? '收起' : '展开'}
        </Button>
      )}
      <Button
        type="text"
        size="small"
        icon={<CopyOutlined />}
        onClick={handleCopy}
      >
        复制
      </Button>
    </Space>
  );

  if (language === 'code') {
    const shown =
      expanded || !needCollapse
        ? formatted
        : lines.slice(0, maxLines).join('\n');

    return (
      <div className={className}>
        {collapseControls}
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 8,
            background: 'var(--ant-color-fill-quaternary, rgba(0,0,0,0.04))',
            overflow: 'auto',
            maxHeight:
              expanded || !needCollapse ? undefined : `${maxLines * 1.5}em`,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.55,
          }}
        >
          <code style={{ whiteSpace: 'pre', wordBreak: 'normal' }}>
            {shown}
            {!expanded && needCollapse ? '\n…' : ''}
          </code>
        </pre>
      </div>
    );
  }

  if (language === 'markdown') {
    return (
      <div className={className}>
        {collapseControls}
        <div
          className="argusMarkdown"
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'var(--ant-color-fill-quaternary, rgba(0,0,0,0.04))',
            maxHeight:
              expanded || !needCollapse ? undefined : `${maxLines * 1.65}em`,
            overflow: expanded || !needCollapse ? 'visible' : 'hidden',
          }}
        >
          <ReactMarkdown
            remarkPlugins={markdownPlugins}
            rehypePlugins={markdownRehypePlugins}
            components={markdownComponents}
          >
            {formatted}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  const shown =
    expanded || !needCollapse ? formatted : lines.slice(0, maxLines).join('\n');

  return (
    <div className={className}>
      {collapseControls}
      <Typography.Paragraph
        style={{
          marginBottom: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily:
            language === 'json'
              ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              : undefined,
          fontSize: 13,
          background: 'var(--ant-color-fill-quaternary, rgba(0,0,0,0.04))',
          padding: 12,
          borderRadius: 8,
          maxHeight:
            expanded || !needCollapse ? undefined : `${maxLines * 1.5}em`,
          overflow: expanded || !needCollapse ? undefined : 'hidden',
        }}
      >
        {shown}
        {!expanded && needCollapse ? '\n…' : ''}
      </Typography.Paragraph>
    </div>
  );
};

export default CollapsibleBlock;

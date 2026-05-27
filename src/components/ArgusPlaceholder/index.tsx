import { PageContainer } from '@ant-design/pro-components';
import { Typography } from 'antd';
import React from 'react';

export type ArgusPlaceholderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/** ArgusMind MVP：统一占位壳，后续任务替换为真实列表/表单 */
const ArgusPlaceholder: React.FC<ArgusPlaceholderProps> = ({
  title,
  description = 'MVP 占位页，后续按规格接入 ProTable 与 Umi Mock。',
  children,
}) => (
  <PageContainer breadcrumb={{}}>
    <Typography.Title level={4}>{title}</Typography.Title>
    <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
    {children}
  </PageContainer>
);

export default ArgusPlaceholder;

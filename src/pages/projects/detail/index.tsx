import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { getProjectDetail, type ProjectItem } from '@/services/projects';

const sourceLabel: Record<string, string> = {
  git: 'Git 仓库',
  upload: '压缩包上传',
  path: '可访问路径',
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProjectItem | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProjectDetail(id)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <Spin />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <p>项目不存在或已删除。</p>
        <Button type="primary" onClick={() => history.push('/projects')}>
          返回列表
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      onBack={() => history.push('/projects')}
      title={data.name}
      breadcrumb={{
        items: [{ title: '项目管理', path: '/projects' }, { title: data.name }],
      }}
    >
      <ProDescriptions<ProjectItem>
        column={2}
        dataSource={data}
        columns={[
          { title: '项目标识', dataIndex: 'key', copyable: true },
          {
            title: '来源类型',
            dataIndex: 'sourceType',
            render: (_, r) => sourceLabel[r.sourceType] ?? r.sourceType,
          },
          { title: '主语言', dataIndex: 'language' },
          { title: '代码规模', dataIndex: 'scale' },
          {
            title: '导入状态',
            dataIndex: 'importStatus',
            valueEnum: {
              pending: { text: '待导入' },
              importing: { text: '导入中' },
              success: { text: '成功' },
              failed: { text: '失败' },
            },
          },
          { title: '导入说明', dataIndex: 'importMessage', span: 2 },
          { title: '仓库 URL', dataIndex: 'repoUrl', span: 2, copyable: true },
          { title: '分支', dataIndex: 'branch' },
          { title: '压缩包文件名', dataIndex: 'archiveFileName' },
          {
            title: '服务端路径',
            dataIndex: 'serverPath',
            span: 2,
            copyable: true,
          },
          {
            title: '最近扫描',
            dataIndex: 'lastScannedAt',
            valueType: 'dateTime',
          },
          { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
          { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime' },
        ]}
      />
    </PageContainer>
  );
};

export default ProjectDetailPage;

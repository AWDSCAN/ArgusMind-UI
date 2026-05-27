import {
  AppstoreOutlined,
  BarsOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
} from '@ant-design/pro-components';
import type { UploadFile } from 'antd';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Pagination,
  Row,
  Segmented,
  Select,
  Spin,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type CreateProjectBody,
  createProject,
  deleteProject,
  getProjectListStats,
  listProjects,
  type ProjectHealthStatus,
  type ProjectListItem,
  type ProjectListStats,
  type ProjectSourceType,
} from '@/services/projects';
import ProjectCard from './components/ProjectCard';
import { useProjectPageStyles } from './projectStyles';
import {
  computeStatsFromList,
  type ProjectSortKey,
  sortProjects,
} from './projectUtils';

type ModalValues = {
  name: string;
  gitUrl?: string;
  branch?: string;
  sourcePath?: string;
};

type FilterDraft = {
  name: string;
  sourceType?: ProjectSourceType;
};

const DEFAULT_PAGE_SIZE = 20;

const sourceTypeOptions = [
  { label: 'Git 仓库', value: 'git' as const },
  { label: '压缩包', value: 'upload' as const },
  { label: '可访问路径', value: 'path' as const },
];

const sortOptions: { label: string; value: ProjectSortKey }[] = [
  { label: '默认排序', value: 'default' },
  { label: '按名称', value: 'name' },
  { label: '按漏洞数', value: 'vuln' },
  { label: '按代码行', value: 'lines' },
];

const ProjectsPage: React.FC = () => {
  const { styles } = useProjectPageStyles();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ProjectListStats | null>(null);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [draft, setDraft] = useState<FilterDraft>({ name: '' });
  const [applied, setApplied] = useState<FilterDraft>({ name: '' });
  const [tabKey, setTabKey] = useState<'all' | ProjectHealthStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortKey, setSortKey] = useState<ProjectSortKey>('default');
  const [open, setOpen] = useState(false);
  const [sourceTab, setSourceTab] =
    useState<CreateProjectBody['sourceType']>('git');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const healthStatus = tabKey === 'all' ? undefined : tabKey;

  const fetchProjects = useCallback(
    async (
      page: number,
      size: number,
      filters: FilterDraft,
      status?: ProjectHealthStatus,
    ) => {
      setLoading(true);
      try {
        const res = await listProjects({
          current: page,
          pageSize: size,
          name: filters.name.trim() || undefined,
          sourceType: filters.sourceType,
          healthStatus: status,
        });
        setProjects(res.data);
        setTotal(res.total);

        const remoteStats = await getProjectListStats({
          name: filters.name.trim() || undefined,
          sourceType: filters.sourceType,
        });
        if (remoteStats) {
          setStats(remoteStats);
        } else {
          setStats(computeStatsFromList(res.data, res.total));
        }
      } catch {
        message.error('加载项目列表失败');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchProjects(current, pageSize, applied, healthStatus);
  }, [current, pageSize, applied, healthStatus, fetchProjects]);

  const displayedProjects = useMemo(
    () => sortProjects(projects, sortKey),
    [projects, sortKey],
  );

  const tabCounts = useMemo(
    () => ({
      all: stats?.total ?? total,
      normal: stats?.normal ?? 0,
      risk: stats?.risk ?? 0,
      pending: stats?.pendingScan ?? 0,
    }),
    [stats, total],
  );

  const tabItems = [
    { key: 'all', label: `全部项目（${tabCounts.all}）` },
    { key: 'normal', label: `正常（${tabCounts.normal}）` },
    { key: 'risk', label: `风险（${tabCounts.risk}）` },
    { key: 'pending_scan', label: `待扫描（${tabCounts.pending}）` },
  ];

  const handleQuery = () => {
    setApplied({ ...draft });
    setCurrent(1);
  };

  const handleReset = () => {
    const empty = { name: '' };
    setDraft(empty);
    setApplied(empty);
    setTabKey('all');
    setCurrent(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSortKey('default');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      message.success('项目已删除');
      const nextPage =
        projects.length === 1 && current > 1 ? current - 1 : current;
      if (nextPage !== current) {
        setCurrent(nextPage);
      } else {
        await fetchProjects(nextPage, pageSize, applied, healthStatus);
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleModalFinish = async (values: ModalValues) => {
    const body: CreateProjectBody = {
      name: values.name,
      sourceType: sourceTab,
    };
    if (sourceTab === 'git') {
      const gitUrl = values.gitUrl?.trim();
      if (!gitUrl) {
        message.error('请填写 Git 仓库 URL');
        return false;
      }
      if (!/^https?:\/\//i.test(gitUrl)) {
        message.error('Git 仓库地址仅支持 http/https');
        return false;
      }
      body.gitUrl = gitUrl;
      body.gitBranch = values.branch?.trim() || 'main';
    } else if (sourceTab === 'upload') {
      const archiveFile = fileList[0]?.originFileObj as File | undefined;
      if (!archiveFile) {
        message.error('请上传 zip 压缩包');
        return false;
      }
      if (!archiveFile.name.toLowerCase().endsWith('.zip')) {
        message.error('仅支持 zip 压缩包');
        return false;
      }
      body.archiveFile = archiveFile;
    } else {
      if (!values.sourcePath?.trim()) {
        message.error('请填写本机可访问绝对路径');
        return false;
      }
      body.sourcePath = values.sourcePath.trim();
    }
    await createProject(body);
    message.success('项目已创建');
    setCurrent(1);
    await fetchProjects(1, pageSize, applied, healthStatus);
    setFileList([]);
    setSourceTab('git');
    return true;
  };

  return (
    <PageContainer ghost title={false}>
      <div className={styles.page}>
        <Card className={styles.searchCard} bordered={false}>
          <div className={styles.searchGrid}>
            <div className={styles.searchField}>
              <span className={styles.searchLabel}>项目名称</span>
              <Input
                placeholder="请输入项目名称"
                allowClear
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                onPressEnter={handleQuery}
              />
            </div>
            <div className={styles.searchField}>
              <span className={styles.searchLabel}>来源类型</span>
              <Select
                allowClear
                placeholder="请选择"
                style={{ width: '100%' }}
                options={sourceTypeOptions}
                value={draft.sourceType}
                onChange={(v) => setDraft((d) => ({ ...d, sourceType: v }))}
              />
            </div>
            <div className={styles.searchActions}>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" onClick={handleQuery}>
                查询
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.listCard} bordered={false}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadLeft}>
              <h2 className={styles.panelTitle}>项目列表</h2>
            </div>
            <div className={styles.panelTools}>
              <Button type="primary" onClick={() => setOpen(true)}>
                新建项目
              </Button>
              <Segmented
                value={viewMode}
                onChange={(v) => setViewMode(v as 'grid' | 'list')}
                options={[
                  { value: 'grid', icon: <AppstoreOutlined /> },
                  { value: 'list', icon: <BarsOutlined /> },
                ]}
              />
              <Select
                value={sortKey}
                onChange={setSortKey}
                options={sortOptions}
                style={{ width: 128 }}
                variant="borderless"
              />
            </div>
          </div>

          <Tabs
            className={styles.statusTabs}
            activeKey={tabKey}
            onChange={(k) => {
              setTabKey(k as typeof tabKey);
              setCurrent(1);
            }}
            items={tabItems}
          />

          <Spin spinning={loading}>
            {displayedProjects.length === 0 ? (
              <div className={styles.emptyWrap}>
                <Empty description="暂无项目" />
              </div>
            ) : viewMode === 'grid' ? (
              <Row gutter={[12, 12]} className={styles.projectGrid}>
                {displayedProjects.map((project) => (
                  <Col key={project.id} xs={24} sm={12} lg={6} xl={6}>
                    <ProjectCard project={project} onDelete={handleDelete} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className={styles.projectGrid}>
                {displayedProjects.map((project) => (
                  <div key={project.id} className={styles.listRow}>
                    <ProjectCard project={project} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            )}
          </Spin>

          {total > 0 ? (
            <div className={styles.paginationWrap}>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showTotal={(t) => `共 ${t} 条`}
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={(page, size) => {
                  setCurrent(page);
                  setPageSize(size);
                }}
              />
            </div>
          ) : null}
        </Card>
      </div>

      <ModalForm<ModalValues>
        title="新建项目"
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setFileList([]);
            setSourceTab('git');
          }
        }}
        modalProps={{ destroyOnClose: true, width: 640 }}
        initialValues={{ branch: 'main' }}
        onFinish={async (values) => {
          try {
            return await handleModalFinish(values);
          } catch {
            message.error('创建失败');
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="项目名称"
          rules={[{ required: true }]}
        />
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          代码来源（三选一）
        </Typography.Paragraph>
        <Tabs
          activeKey={sourceTab}
          onChange={(k) => setSourceTab(k as CreateProjectBody['sourceType'])}
          items={[
            {
              key: 'git',
              label: 'Git 仓库',
              children: (
                <>
                  <ProFormText
                    name="gitUrl"
                    label="仓库 URL"
                    placeholder="https://github.com/org/repo.git"
                  />
                  <ProFormText name="branch" label="分支" placeholder="main" />
                </>
              ),
            },
            {
              key: 'upload',
              label: '上传压缩包',
              children: (
                <Form.Item label="文件">
                  <Upload
                    beforeUpload={() => false}
                    accept=".zip"
                    maxCount={1}
                    fileList={fileList}
                    onChange={({ fileList: fl }) => setFileList(fl)}
                  >
                    <Button>选择 zip</Button>
                  </Upload>
                </Form.Item>
              ),
            },
            {
              key: 'path',
              label: '可访问路径',
              children: (
                <ProFormText
                  name="sourcePath"
                  label="本机可访问绝对路径"
                  placeholder="D:/repos/my-app"
                />
              ),
            },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ProjectsPage;

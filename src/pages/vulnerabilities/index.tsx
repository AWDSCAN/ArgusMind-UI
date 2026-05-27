import { BugOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, message, Popconfirm, Typography } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getProjectOptions } from '@/services/projects';
import { getTaskOptions } from '@/services/tasks';
import {
  deleteVulnerability,
  listVulnerabilities,
  updateVulnerabilityStatus,
  type VulnerabilityListItem,
  type VulnSeverity,
  type VulnStatus,
} from '@/services/vulnerabilities';
import { formatUtcForLocalDisplay } from '@/utils/utcDateTimeDisplay';
import { useVulnerabilityPageStyles } from './vulnerabilityStyles';
import {
  getConfidenceTone,
  getSeverityTone,
  getVerdictTone,
  getVerificationTone,
  severityValueEnum,
  statusValueEnum,
  VulnBadge,
  VulnStatusCell,
} from './vulnerabilityUi';

function readIdFromSearch(
  search: string,
  keys: [string, string],
): string | undefined {
  const q = new URLSearchParams(search);
  const id = (q.get(keys[0]) ?? q.get(keys[1]))?.trim();
  return id || undefined;
}

const VulnerabilitiesPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const location = useLocation();
  const { styles } = useVulnerabilityPageStyles();
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const initialTaskId = useMemo(
    () => readIdFromSearch(location.search, ['taskId', 'task_id']),
    [location.search],
  );

  const initialProjectId = useMemo(
    () => readIdFromSearch(location.search, ['projectId', 'project_id']),
    [location.search],
  );

  const formInitialValues = useMemo(() => {
    const values: { taskId?: string; projectId?: string } = {};
    if (initialTaskId) values.taskId = initialTaskId;
    if (initialProjectId) values.projectId = initialProjectId;
    return Object.keys(values).length > 0 ? values : undefined;
  }, [initialTaskId, initialProjectId]);

  const handleStatusChange = useCallback(
    async (record: VulnerabilityListItem, nextStatus: VulnStatus) => {
      if (record.status === nextStatus) return;
      setStatusUpdatingId(record.id);
      try {
        const res = await updateVulnerabilityStatus(record.id, nextStatus);
        if (res.success) {
          message.success('状态已更新');
          actionRef.current?.reload();
        } else {
          message.error('更新状态失败');
        }
      } catch {
        message.error('更新状态失败');
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [],
  );

  const columns: ProColumns<VulnerabilityListItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '漏洞名称 / 结论 / 分类' },
    },
    {
      title: '漏洞',
      dataIndex: 'title',
      search: false,
      ellipsis: true,
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <div className={styles.titleCell}>
          <span
            className={styles.titleLink}
            onClick={() => history.push(`/vulnerabilities/${record.id}`)}
          >
            {record.title}
          </span>
          {record.cwe ? (
            <span className={styles.titleMeta}>{record.cwe}</span>
          ) : null}
        </div>
      ),
    },
    {
      title: '等级',
      dataIndex: 'severity',
      valueType: 'select',
      valueEnum: severityValueEnum,
      width: 108,
      render: (_, record) => {
        const tone = getSeverityTone(record.severity);
        return (
          <span className={styles.severityCell}>
            <span
              className={styles.severityDot}
              style={{ background: tone.dot ?? tone.color }}
            />
            <VulnBadge
              tone={tone}
              className={styles.badge}
              emptyClassName={styles.empty}
            />
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusValueEnum,
      width: 120,
      render: (_, record) => (
        <VulnStatusCell
          status={record.status}
          loading={statusUpdatingId === record.id}
          onChange={(next) => handleStatusChange(record, next)}
          badgeClassName={styles.badge}
          buttonClassName={styles.statusBadgeBtn}
        />
      ),
    },
    {
      title: '判定',
      dataIndex: 'verdict',
      search: false,
      width: 112,
      render: (_, record) => (
        <VulnBadge
          tone={getVerdictTone(record.verdict)}
          className={styles.badge}
          emptyClassName={styles.empty}
        />
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      search: false,
      width: 88,
      render: (_, record) => (
        <VulnBadge
          tone={getConfidenceTone(record.confidence)}
          className={styles.badge}
          emptyClassName={styles.empty}
        />
      ),
    },
    {
      title: '二次校验',
      dataIndex: 'verificationStatus',
      search: false,
      width: 100,
      render: (_, record) => (
        <VulnBadge
          tone={getVerificationTone(record.verificationStatus)}
          className={styles.badge}
          emptyClassName={styles.empty}
        />
      ),
    },
    {
      title: '项目',
      dataIndex: 'projectId',
      valueType: 'select',
      hideInTable: true,
      fieldProps: { showSearch: true, optionFilterProp: 'label' },
      request: async () => {
        const options = await getProjectOptions();
        return options.map((p) => ({ label: p.name, value: p.id }));
      },
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      search: false,
      ellipsis: true,
      width: 140,
      render: (_, record) => (
        <span className={styles.metaCell} title={record.projectName}>
          {record.projectName}
        </span>
      ),
    },
    {
      title: '任务',
      dataIndex: 'taskId',
      valueType: 'select',
      hideInTable: true,
      fieldProps: { showSearch: true, optionFilterProp: 'label' },
      request: async () => {
        const options = await getTaskOptions();
        return options.map((t) => ({ label: t.name, value: t.id }));
      },
    },
    {
      title: '关联任务',
      dataIndex: 'taskName',
      search: false,
      ellipsis: true,
      width: 140,
      render: (_, record) => (
        <span className={styles.metaCell} title={record.taskName}>
          {record.taskName}
        </span>
      ),
    },
    {
      title: '分类',
      dataIndex: 'cwe',
      search: false,
      width: 120,
      render: (_, record) =>
        record.cwe ? (
          <span className={styles.cwePill} title={record.cwe}>
            {record.cwe}
          </span>
        ) : (
          <span className={styles.empty}>—</span>
        ),
    },
    {
      title: '发现时间',
      dataIndex: 'discoveredAt',
      valueType: 'dateTime',
      search: false,
      width: 168,
      render: (_, record) => (
        <span className={styles.timeCell}>
          {formatUtcForLocalDisplay(record.discoveredAt) || '—'}
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() => history.push(`/vulnerabilities/${record.id}`)}
        >
          详情
        </Button>,
        <Popconfirm
          key="delete"
          title="确定删除该漏洞？"
          description="删除后无法恢复"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            setDeletingId(record.id);
            try {
              await deleteVulnerability(record.id);
              message.success('漏洞已删除');
              actionRef.current?.reload();
            } catch {
              message.error('删除失败');
            } finally {
              setDeletingId(null);
            }
          }}
        >
          <Button
            type="link"
            size="small"
            danger
            loading={deletingId === record.id}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer className={styles.page} title="漏洞管理">
      <ProTable<VulnerabilityListItem>
        className={styles.tableWrap}
        headerTitle={
          <Typography.Text>
            <BugOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            漏洞列表
          </Typography.Text>
        }
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1320 }}
        form={{ initialValues: formInitialValues }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          span: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4 },
        }}
        options={{ density: true, reload: true, setting: true }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          defaultPageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        request={async (params) => {
          const res = await listVulnerabilities({
            current: params.current,
            pageSize: params.pageSize,
            keyword: params.keyword as string,
            severity: params.severity as VulnSeverity,
            status: params.status as VulnStatus,
            projectId: params.projectId as string,
            taskId: params.taskId as string,
          });
          return { data: res.data, success: res.success, total: res.total };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default VulnerabilitiesPage;

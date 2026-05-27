import { CheckCircleOutlined } from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Link, useAntdConfig } from '@umijs/max';
import {
  Alert,
  Button,
  Empty,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import type { DashboardRecentTask } from '@/services/dashboard';
import { formatTokenCount } from '@/utils/formatTokenCount';
import { DashboardHero } from './DashboardHero';
import {
  chartCardBody,
  chartCardBodySm,
  chartsRow3,
  chartsRowBottom,
} from './dashboardStyles';
import { trendRangeLabel } from './dashboardTrendRange';
import { formatDuration } from './formatDashboard';
import { KpiCards } from './KpiCards';
import { TaskStatusPie } from './TaskStatusPie';
import { TopVulnTypeList } from './TopVulnTypeList';
import { TrendRangeSegmented } from './TrendRangeSegmented';
import { useDashboardData } from './useDashboardData';

const taskStatusMeta: Record<
  string,
  { text: string; color: string; dot: string }
> = {
  pending: { text: '待执行', color: 'default', dot: '#8c8c8c' },
  running: { text: '运行中', color: 'processing', dot: '#1677ff' },
  completed: { text: '已完成', color: 'success', dot: '#22c55e' },
  failed: { text: '失败', color: 'error', dot: '#ef4444' },
  cancelled: { text: '已取消', color: 'warning', dot: '#faad14' },
};

function useIsAntdDark() {
  const antdCfg = useAntdConfig();
  const algo = antdCfg?.theme?.algorithm;
  const list = Array.isArray(algo) ? algo : algo != null ? [algo] : [];
  return list.includes(theme.darkAlgorithm);
}

function StatusTag({ status }: { status: string }) {
  const m = taskStatusMeta[status] ?? {
    text: status,
    color: 'default',
    dot: '#8c8c8c',
  };
  return (
    <Tag
      bordered={false}
      style={{
        background:
          m.color === 'processing'
            ? '#eaf3ff'
            : m.color === 'success'
              ? '#e9f8f0'
              : m.color === 'error'
                ? '#fff0f1'
                : undefined,
        color:
          m.color === 'processing'
            ? '#1677ff'
            : m.color === 'success'
              ? '#12a150'
              : m.color === 'error'
                ? '#ef4444'
                : undefined,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: m.dot,
          marginRight: 6,
        }}
      />
      {m.text}
    </Tag>
  );
}

const DashboardPage: React.FC = () => {
  const isDark = useIsAntdDark();
  const plotTheme = isDark ? ('dark' as const) : ('light' as const);
  const {
    data: summary,
    loading,
    trendLoading,
    error,
    refresh,
    trendRange,
    setTrendRange,
  } = useDashboardData();

  const trendRangeText = trendRangeLabel(trendRange);

  const vulnTrendLineData = useMemo(() => {
    if (!summary?.vulnTrend?.length) return [];
    const severitySeries = [
      { key: 'critical' as const, label: '严重' },
      { key: 'high' as const, label: '高' },
      { key: 'medium' as const, label: '中' },
      { key: 'low' as const, label: '低' },
      { key: 'info' as const, label: '信息' },
      { key: 'unknown' as const, label: '未分级' },
    ];
    const active = severitySeries.filter((s) =>
      summary.vulnTrend.some((row) => (row[s.key] ?? 0) > 0),
    );
    return summary.vulnTrend.flatMap((row) =>
      active.map((s) => ({
        day: row.day,
        series: s.label,
        value: row[s.key] ?? 0,
      })),
    );
  }, [summary]);

  const tokenColumnData = useMemo(() => {
    if (!summary?.tokenTrend?.length) return [];
    return summary.tokenTrend.map((row) => ({
      day: row.day,
      tokensM: row.tokens / 1_000_000,
    }));
  }, [summary]);

  const riskPieData = useMemo(() => {
    if (!summary?.riskDistribution?.length) return [];
    return summary.riskDistribution.map((s) => ({
      type: s.label,
      value: s.count,
    }));
  }, [summary]);

  const recentColumns: ColumnsType<DashboardRecentTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (text, record) => <Link to={`/tasks/${record.id}`}>{text}</Link>,
    },
    { title: '项目', dataIndex: 'projectName', width: 120, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: '漏洞数',
      dataIndex: 'vulnCount',
      align: 'right',
    },
    {
      title: 'Token 消耗',
      dataIndex: 'tokenUsed',
      align: 'right',
      render: (v: number) => formatTokenCount(v),
    },
    {
      title: '运行时长',
      dataIndex: 'durationSeconds',
      render: (v: number | null) => formatDuration(v),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => <Link to={`/tasks/${record.id}`}>详情</Link>,
    },
  ];

  if (error && !summary && !loading) {
    return (
      <PageContainer ghost title={false}>
        <Alert
          type="error"
          showIcon
          message="仪表盘加载失败"
          description={
            error instanceof Error ? error.message : String(error ?? '未知错误')
          }
          action={
            <Button size="small" onClick={() => refresh()}>
              重试
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
        <DashboardHero onRefresh={() => refresh()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer ghost title={false}>
      <Spin spinning={loading}>
        <DashboardHero header={summary?.header} onRefresh={() => refresh()} />

        {summary?.kpiCards ? <KpiCards cards={summary.kpiCards} /> : null}

        <div style={chartsRow3}>
          <ProCard
            bordered
            title={`漏洞趋势`}
            extra={
              <TrendRangeSegmented
                value={trendRange}
                onChange={setTrendRange}
                disabled={loading || trendLoading}
              />
            }
          >
            <Spin spinning={trendLoading} size="small">
              <span style={{ ...chartCardBody, display: 'block' }}>
                {vulnTrendLineData.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Line
                    theme={plotTheme}
                    data={vulnTrendLineData}
                    xField="day"
                    yField="value"
                    colorField="series"
                    shapeField="smooth"
                    height={260}
                    point={{ sizeField: 3 }}
                    legend={{ color: { position: 'top' } }}
                    scale={{
                      color: {
                        range: [
                          '#991b1b',
                          '#dc2626',
                          '#ea580c',
                          '#2563eb',
                          '#64748b',
                          '#8b5cf6',
                        ],
                      },
                    }}
                  />
                )}
              </span>
            </Spin>
          </ProCard>

          <ProCard
            bordered
            title={
              <Space>
                <span>模型调用消耗趋势</span>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  单位：百万 Token
                </Typography.Text>
              </Space>
            }
            extra={
              <TrendRangeSegmented
                value={trendRange}
                onChange={setTrendRange}
                disabled={loading || trendLoading}
              />
            }
          >
            <Spin spinning={trendLoading} size="small">
              <span style={{ ...chartCardBody, display: 'block' }}>
                {tokenColumnData.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Column
                    theme={plotTheme}
                    data={tokenColumnData}
                    xField="day"
                    yField="tokensM"
                    height={260}
                    style={{ maxWidth: 28, fill: '#7c3aed' }}
                    axis={{
                      y: { labelFormatter: (v: string) => `${v}M` },
                    }}
                    legend={false}
                  />
                )}
              </span>
            </Spin>
          </ProCard>

          <ProCard bordered title="任务实时状态">
            <TaskStatusPie
              data={summary?.taskStatusDistribution ?? []}
              plotTheme={plotTheme}
            />
          </ProCard>
        </div>

        <div style={chartsRowBottom}>
          <ProCard bordered title="漏洞风险分布">
            <span style={{ ...chartCardBodySm, display: 'block' }}>
              {riskPieData.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Pie
                  theme={plotTheme}
                  data={riskPieData}
                  angleField="value"
                  colorField="type"
                  innerRadius={0.58}
                  height={220}
                  scale={{
                    color: {
                      range: [
                        '#991b1b',
                        '#dc2626',
                        '#ea580c',
                        '#2563eb',
                        '#64748b',
                        '#8b5cf6',
                      ],
                    },
                  }}
                  legend={{
                    color: { position: 'right', layout: 'vertical' },
                  }}
                  label={false}
                  tooltip={{
                    title: (d: { type: string }) => d.type,
                    items: [
                      (d: { type: string; value: number }) => ({
                        name: '数量',
                        value: d.value,
                      }),
                    ],
                  }}
                />
              )}
            </span>
          </ProCard>

          <ProCard bordered title="漏洞分类">
            <TopVulnTypeList items={summary?.topVulnTypes ?? []} />
          </ProCard>

          <ProCard bordered title="Top 风险项目">
            <Table
              size="small"
              pagination={false}
              rowKey="projectId"
              dataSource={summary?.topRiskProjects ?? []}
              columns={[
                {
                  title: '项目',
                  dataIndex: 'projectName',
                  ellipsis: true,
                },
                {
                  title: '漏洞数',
                  dataIndex: 'vulnCount',
                  width: 64,
                  align: 'right',
                },
                {
                  title: '高危数',
                  dataIndex: 'highRiskCount',
                  width: 64,
                  align: 'right',
                  render: (v: number) => (
                    <Typography.Text type="danger" strong>
                      {v}
                    </Typography.Text>
                  ),
                },
              ]}
            />
          </ProCard>
        </div>

        <ProCard
          bordered
          style={{ marginTop: 0 }}
          title={
            <Space>
              <CheckCircleOutlined />
              <span>最近任务</span>
            </Space>
          }
          extra={
            <Link to="/tasks" style={{ fontSize: 13 }}>
              查看更多 ›
            </Link>
          }
        >
          <Table<DashboardRecentTask>
            rowKey="id"
            size="small"
            scroll={{ x: 960 }}
            pagination={false}
            columns={recentColumns}
            dataSource={summary?.recentTasks ?? []}
            locale={{ emptyText: loading ? '加载中…' : '暂无任务' }}
          />
        </ProCard>
      </Spin>
    </PageContainer>
  );
};

export default DashboardPage;

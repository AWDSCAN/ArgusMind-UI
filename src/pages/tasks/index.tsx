import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Modal, message, Popconfirm, Space } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { listProjects, type ProjectListItem } from '@/services/projects';
import {
  createTaskApiTasksPost,
  listTasksApiTasksGet,
  pauseTaskApiTasksTaskIdPauseGet,
  resumeTaskApiTasksTaskIdResumeGet,
} from '@/services/swagger/tasks';
import {
  batchDeleteTasks,
  batchPauseTasks,
  batchResumeTasks,
  type TaskBatchResult,
} from '@/services/tasks';
import { formatTokenCount } from '@/utils/formatTokenCount';
import { formatUtcForLocalDisplay } from '@/utils/utcDateTimeDisplay';
import {
  type TaskStatus,
  TaskStatusTag,
  taskStatusValueEnum,
} from './taskStatusUi';

type TaskItem = {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  createdAt: string;
  finishedAt?: string | null;
  vulnCount?: number;
  tokenUsed?: number;
};

function reportBatchResult(action: string, result: TaskBatchResult) {
  const ok = result.tasks?.length ?? 0;
  const failed = result.errors?.length ?? 0;
  if (ok > 0 && failed === 0) {
    message.success(`${action}成功 ${ok} 项`);
    return;
  }
  if (ok > 0 && failed > 0) {
    const detail = result.errors.map((e) => e.message).join('；');
    message.warning(`${action}成功 ${ok} 项，失败 ${failed} 项：${detail}`);
    return;
  }
  if (failed > 0) {
    const detail = result.errors.map((e) => e.message).join('；');
    message.error(`${action}失败：${detail}`);
  }
}

const TasksPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [open, setOpen] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [batchActing, setBatchActing] = useState<
    'pause' | 'resume' | 'delete' | null
  >(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [taskStatusById, setTaskStatusById] = useState<
    Record<string, TaskStatus>
  >({});
  const [projectOptions, setProjectOptions] = useState<ProjectListItem[]>([]);

  const selectedRunningIds = useMemo(
    () =>
      selectedRowKeys.filter(
        (id) => taskStatusById[String(id)] === 'running',
      ) as string[],
    [selectedRowKeys, taskStatusById],
  );

  const selectedPausedIds = useMemo(
    () =>
      selectedRowKeys.filter(
        (id) => taskStatusById[String(id)] === 'paused',
      ) as string[],
    [selectedRowKeys, taskStatusById],
  );

  const clearSelection = () => setSelectedRowKeys([]);

  const selectedTaskIds = useMemo(
    () => selectedRowKeys.map(String),
    [selectedRowKeys],
  );

  const runBatchDelete = (taskIds: string[]) => {
    if (!taskIds.length) {
      message.warning('请先选择要删除的任务');
      return;
    }
    Modal.confirm({
      title: '确定删除所选任务？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除 ${taskIds.length} 个任务，删除后无法恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setBatchActing('delete');
        try {
          const res = await batchDeleteTasks(taskIds);
          reportBatchResult('批量删除', res.data);
          clearSelection();
          actionRef.current?.reload();
        } catch {
          message.error('批量删除失败');
        } finally {
          setBatchActing(null);
        }
      },
    });
  };

  const runBatch = async (
    kind: 'pause' | 'resume',
    taskIds: string[],
    actionLabel: string,
  ) => {
    if (!taskIds.length) {
      message.warning(
        kind === 'pause'
          ? '所选任务中没有可暂停的运行中任务'
          : '所选任务中没有可继续的已暂停任务',
      );
      return;
    }
    setBatchActing(kind);
    try {
      const res =
        kind === 'pause'
          ? await batchPauseTasks(taskIds)
          : await batchResumeTasks(taskIds);
      reportBatchResult(`批量${actionLabel}`, res.data);
      clearSelection();
      actionRef.current?.reload();
    } catch {
      message.error(`批量${actionLabel}失败`);
    } finally {
      setBatchActing(null);
    }
  };

  useEffect(() => {
    listProjects({ current: 1, pageSize: 200 }).then((r) =>
      setProjectOptions(r.data),
    );
  }, []);

  const projectSelectOptions = useMemo(
    () =>
      projectOptions.map((p) => ({
        label: p.name,
        value: p.id,
        projectName: p.name,
      })),
    [projectOptions],
  );

  const columns: ProColumns<TaskItem>[] = [
    {
      title: '任务名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '项目',
      dataIndex: 'projectId',
      valueType: 'select',
      hideInTable: true,
      request: async () => {
        const r = await listProjects({ current: 1, pageSize: 200 });
        return r.data.map((p) => ({ label: p.name, value: p.id }));
      },
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: taskStatusValueEnum,
      width: 108,
      render: (_, { status }) => <TaskStatusTag status={status} />,
    },
    {
      title: '漏洞数',
      dataIndex: 'vulnCount',
      search: false,
      width: 80,
    },
    {
      title: 'Token',
      dataIndex: 'tokenUsed',
      search: false,
      width: 88,
      render: (_, r) => {
        if (r.tokenUsed == null) return '—';
        const label = formatTokenCount(r.tokenUsed);
        return <span title={r.tokenUsed.toLocaleString()}>{label}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      search: false,
      width: 180,
      ellipsis: true,
      render: (_, r) => formatUtcForLocalDisplay(r.createdAt),
    },
    {
      title: '完成时间',
      dataIndex: 'finishedAt',
      search: false,
      width: 180,
      ellipsis: true,
      render: (_, r) =>
        r.finishedAt ? formatUtcForLocalDisplay(r.finishedAt) : '—',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 380,
      fixed: 'right',
      render: (_, record) => {
        const acting = actingId === record.id;
        return (
          <Space size="small" wrap>
            <Button
              key="detail"
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => {
                history.push(`/tasks/${record.id}`);
              }}
            >
              任务详情
            </Button>
            <Button
              key="vulns"
              variant="outlined"
              size="small"
              onClick={() => {
                const q = new URLSearchParams({ taskId: record.id });
                window.open(
                  `/vulnerabilities?${q.toString()}`,
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
            >
              漏洞列表
            </Button>
            {record.status === 'running' ? (
              <Button
                key="pause"
                color="gold"
                variant="outlined"
                size="small"
                loading={acting}
                onClick={async () => {
                  setActingId(record.id);
                  try {
                    await pauseTaskApiTasksTaskIdPauseGet({
                      task_id: record.id,
                    });
                    message.success('任务已暂停');
                    actionRef.current?.reload();
                  } catch {
                    message.error('暂停失败');
                  } finally {
                    setActingId(null);
                  }
                }}
              >
                暂停
              </Button>
            ) : null}
            {record.status === 'paused' ? (
              <Button
                key="resume"
                color="primary"
                variant="solid"
                size="small"
                loading={acting}
                onClick={async () => {
                  setActingId(record.id);
                  try {
                    await resumeTaskApiTasksTaskIdResumeGet({
                      task_id: record.id,
                    });
                    message.success('任务已继续');
                    actionRef.current?.reload();
                  } catch {
                    message.error('继续失败');
                  } finally {
                    setActingId(null);
                  }
                }}
              >
                继续
              </Button>
            ) : null}
            <Popconfirm
              key="delete"
              title="确定删除该任务？"
              description="删除后无法恢复"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                setActingId(record.id);
                try {
                  const res = await batchDeleteTasks([record.id]);
                  reportBatchResult('删除', res.data);
                  actionRef.current?.reload();
                } catch {
                  message.error('删除失败');
                } finally {
                  setActingId(null);
                }
              }}
            >
              <Button danger variant="outlined" size="small" loading={acting}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<TaskItem>
        headerTitle="任务管理"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableAlertRender={({ selectedRowKeys: keys, onCleanSelected }) => (
          <Space size="middle">
            <span>已选 {keys.length} 项</span>
            <Button
              size="small"
              color="gold"
              variant="outlined"
              loading={batchActing === 'pause'}
              disabled={
                batchActing === 'resume' ||
                batchActing === 'delete' ||
                !selectedRunningIds.length
              }
              onClick={() => runBatch('pause', selectedRunningIds, '暂停')}
            >
              批量暂停
              {selectedRunningIds.length
                ? ` (${selectedRunningIds.length})`
                : ''}
            </Button>
            <Button
              size="small"
              color="primary"
              variant="solid"
              loading={batchActing === 'resume'}
              disabled={
                batchActing === 'pause' ||
                batchActing === 'delete' ||
                !selectedPausedIds.length
              }
              onClick={() => runBatch('resume', selectedPausedIds, '继续')}
            >
              批量继续
              {selectedPausedIds.length ? ` (${selectedPausedIds.length})` : ''}
            </Button>
            <Button
              size="small"
              danger
              loading={batchActing === 'delete'}
              disabled={
                batchActing === 'pause' ||
                batchActing === 'resume' ||
                !selectedTaskIds.length
              }
              onClick={() => runBatchDelete(selectedTaskIds)}
            >
              批量删除
              {selectedTaskIds.length ? ` (${selectedTaskIds.length})` : ''}
            </Button>
            <Button type="link" size="small" onClick={onCleanSelected}>
              取消选择
            </Button>
          </Space>
        )}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={() => setOpen(true)}>
            创建任务
          </Button>,
        ]}
        request={async (params) => {
          let projects = projectOptions;
          if (!projects.length) {
            const pr = await listProjects({ current: 1, pageSize: 200 });
            projects = pr.data;
            setProjectOptions(projects);
          }

          const res = await listTasksApiTasksGet({
            current: params.current,
            pageSize: params.pageSize,
            status: params.status as TaskStatus,
            project_id: params.projectId as string,
          });
          const projectNameMap = new Map(
            projects.map((p) => [p.id, p.name] as const),
          );
          const data: TaskItem[] = (res.data ?? [])
            .filter((t) =>
              params.name ? t.name.includes(String(params.name)) : true,
            )
            .map((t) => ({
              id: t.id,
              name: t.name,
              projectId: t.project_id,
              projectName: projectNameMap.get(t.project_id) ?? '未知项目',
              status: (t.status as TaskStatus) ?? 'pending',
              createdAt: t.created_at,
              finishedAt: t.finished_at,
              vulnCount: t.vulnCount ?? 0,
              tokenUsed:
                (t.llm_input_token ?? 0) +
                (t.llm_output_token ?? 0) +
                (t.code_agent_input_token ?? 0) +
                (t.code_agent_output_token ?? 0),
            }));
          setTaskStatusById((prev) => {
            const next = { ...prev };
            for (const row of data) {
              next[row.id] = row.status;
            }
            return next;
          });
          return { data, success: true, total: res.total ?? data.length };
        }}
        columns={columns}
      />

      <ModalForm<{
        name: string;
        projectId: string;
      }>
        title="创建扫描任务"
        open={open}
        onOpenChange={setOpen}
        modalProps={{ destroyOnClose: true, width: 520 }}
        onFinish={async (values) => {
          try {
            const opt = projectSelectOptions.find(
              (o) => o.value === values.projectId,
            );
            const projectName = opt?.projectName ?? '';
            if (!projectName) {
              message.error('请选择项目');
              return false;
            }
            await createTaskApiTasksPost({
              name: values.name,
              project_id: values.projectId,
            });
            message.success('任务已创建');
            actionRef.current?.reload();
            return true;
          } catch {
            message.error('创建失败');
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="任务名称"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="projectId"
          label="项目"
          rules={[{ required: true, message: '请选择项目' }]}
          options={projectSelectOptions.map(({ label, value }) => ({
            label,
            value,
          }))}
          showSearch
          placeholder="选择已导入项目"
        />
      </ModalForm>
    </>
  );
};

export default TasksPage;

import { request } from '@umijs/max';
import type { TaskCompletionStatusResponse } from '@/types/taskCompletionStatus';

export type TaskOption = {
  id: string;
  name: string;
};

export type TaskBatchIdsBody = {
  taskIds: string[];
};

export type TaskBatchError = {
  taskId: string;
  message: string;
};

export type TaskBatchResult = {
  tasks: API.TaskRead[];
  errors: TaskBatchError[];
};

type TaskBatchOkResponse = {
  success: boolean;
  data: TaskBatchResult;
};

/** 下拉选项 `GET /api/tasks/options`（全量，不分页） */
export async function getTaskOptions() {
  const res = await request<{ success: boolean; data: TaskOption[] }>(
    '/api/tasks/options',
    { method: 'GET' },
  );
  return res.data ?? [];
}

/** 批量暂停 `POST /api/tasks/batch/pause` */
export async function batchPauseTasks(taskIds: string[]) {
  return request<TaskBatchOkResponse>('/api/tasks/batch/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { taskIds } satisfies TaskBatchIdsBody,
  });
}

/** 批量恢复 `POST /api/tasks/batch/resume` */
export async function batchResumeTasks(taskIds: string[]) {
  return request<TaskBatchOkResponse>('/api/tasks/batch/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { taskIds } satisfies TaskBatchIdsBody,
  });
}

/** 批量删除 `POST /api/tasks/batch/delete` */
export async function batchDeleteTasks(taskIds: string[]) {
  return request<TaskBatchOkResponse>('/api/tasks/batch/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { taskIds } satisfies TaskBatchIdsBody,
  });
}

/** 任务完成度 / TODO 树 `GET /api/tasks/{taskId}/completion-status` */
export async function getTaskCompletionStatus(taskId: string) {
  return request<TaskCompletionStatusResponse>(
    `/api/tasks/${taskId}/completion-status`,
    { method: 'GET' },
  );
}

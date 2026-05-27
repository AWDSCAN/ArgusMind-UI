/** `GET /api/tasks/{taskId}/completion-status` */
export type TaskRiskCategoryCompletion = {
  node_id: string;
  category_name: string;
  status: string;
  level: number;
  sink_finder_completed: boolean;
};

export type TaskLanguageCompletion = {
  node_id: string;
  language: string;
  status: string;
  level: number;
  risk_categories: TaskRiskCategoryCompletion[];
};

export type TaskCompletionStatusData = {
  task_id: string;
  languages: TaskLanguageCompletion[];
};

export type TaskCompletionStatusResponse = {
  success: boolean;
  data: TaskCompletionStatusData;
};

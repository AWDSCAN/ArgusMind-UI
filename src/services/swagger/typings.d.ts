declare namespace API {
  type AuditTaskCreate = {
    /** Project Id */
    project_id: string;
    /** Name */
    name: string;
  };

  type BodyCreateProjectApiProjectsPost = {
    /** Name */
    name: string;
    /** Source Type */
    source_type: string;
    /** Git Url */
    git_url?: string | null;
    /** Git Branch */
    git_branch?: string | null;
    /** Source Path */
    source_path?: string | null;
    /** Archive File */
    archive_file?: string | null;
  };

  type cancelTaskApiTasksTaskIdCancelPostParams = {
    task_id: string;
  };

  type chainsByTaskApiChainsByTaskTaskIdGetParams = {
    task_id: string;
  };

  type chainGraphByArApiChainGraphByArGetParams = {
    ar_node_id: string;
    task_id: string;
  };

  type chainGraphByVulApiChainGraphByVulGetParams = {
    vul_node_id: string;
    task_id: string;
    max_depth?: number;
    include_completed_results?: boolean;
  };

  type CodeAgentConfigUpdate = {
    /** Code Agent Provider */
    code_agent_provider?: string | null;
    /** Code Agent Key */
    code_agent_key?: string | null;
    /** Code Agent Model */
    code_agent_model?: string | null;
    /** Code Agent Baseurl */
    code_agent_baseurl?: string | null;
    /** Code Agent Engine */
    code_agent_engine?: string | null;
    /** Type */
    type?: string | null;
  };

  type CurrentUser = {
    /** Id */
    id: string;
    /** Username */
    username: string;
    /** Display Name */
    display_name: string;
    /** Is Active */
    is_active: boolean;
    /** Is Superuser */
    is_superuser: boolean;
  };

  type deleteProjectByQueryApiProjectsDeleteParams = {
    id: string;
  };

  type deleteTaskApiTasksTaskIdDeleteParams = {
    task_id: string;
  };

  type EventDetailRead = {
    /** Tool Arguments */
    tool_arguments?: Record<string, any> | null;
    /** Tool Output */
    tool_output?: string | null;
    /** Code Agent Chain Of Thought */
    code_agent_chain_of_thought?: Record<string, any>[] | null;
  };

  /** OpenCode SSE 事件行（code_agent 详情） */
  type OpencodeEventRead = {
    id: number;
    event_id: number;
    session_id?: string | null;
    event_type: string;
    part_type?: string | null;
    part_id?: string | null;
    message_id?: string | null;
    tool_name?: string | null;
    tool_status?: string | null;
    title?: string | null;
    content?: string | null;
    token_input?: number | null;
    token_output?: number | null;
    payload?: Record<string, unknown> | null;
    created_at: string;
  };

  type PageResultOpencodeEventRead_ = {
    data: OpencodeEventRead[];
    total: number;
    success?: boolean;
  };

  type EventRead = {
    /** Id */
    id: number;
    /** Task Id */
    task_id?: string | null;
    /** Module */
    module: string;
    /** Action Type */
    action_type: string;
    /** Tool Name */
    tool_name: string;
    /** Status */
    status: string;
    /** Reason */
    reason: string;
    /** Final Status */
    final_status: string;
    /** Started At */
    started_at: string;
    /** Finished At */
    finished_at?: string | null;
    /** Llm Input Delta */
    llm_input_delta?: number;
    /** Llm Output Delta */
    llm_output_delta?: number;
    /** Code Agent Input Delta */
    code_agent_input_delta?: number;
    /** Code Agent Output Delta */
    code_agent_output_delta?: number;
    detail?: EventDetailRead | null;
  };

  type FindingDetailSchema = {
    /** Evidence */
    evidence?: string;
    /** Detail */
    detail?: string;
    /** Entry Points */
    entry_points?: string;
    /** Security Boundaries */
    security_boundaries?: string;
    /** Analysis Rounds */
    analysis_rounds?: number;
    /** Verification Status */
    verification_status?: string;
    /** Verification Reason */
    verification_reason?: string;
    /** Vulnerability Analysis Report */
    vulnerability_analysis_report?: string;
    /** Poc */
    poc?: string;
    /** Exploitation chain (JSON from engine / Neo4j walk) */
    exploitation_chain?: Record<string, any> | null;
  };

  type FindingRead = {
    /** Id */
    id: string;
    /** Project Id */
    project_id: string;
    /** Task Id */
    task_id?: string | null;
    /** Vul Name */
    vul_name: string;
    /** Category Name */
    category_name?: string;
    /** Severity / level label from confirmation pipeline */
    level?: string;
    /** Verdict */
    verdict?: string;
    /** Secondary verification status (CONFIRMED / REJECTED) */
    verification_status?: string;
    /** Workflow status */
    status?: string;
    /** Neo4J Element Id */
    neo4j_element_id?: string;
    /** Confidence */
    confidence?: string;
    /** Created At */
    created_at: string;
    /** Updated At */
    updated_at: string;
    detail?: FindingDetailSchema | null;
  };

  type FindingUpdate = {
    /** Verdict */
    verdict?: string | null;
    /** Confidence */
    confidence?: string | null;
    /** Level */
    level?: string | null;
    /** Status */
    status?: string | null;
  };

  type FindingStatusUpdate = {
    /** Workflow status */
    status: string;
  };

  type getEventApiEventsEventIdGetParams = {
    event_id: number;
  };

  type getFindingApiFindingsFindingIdGetParams = {
    finding_id: string;
  };

  type getGraphApiGraphGetParams = {
    /** 按 Project.id / name 过滤；可选 */
    project_id?: string | null;
    /** 按任务过滤；可选 */
    task_id?: string | null;
    depth?: number;
    limit?: number;
  };

  type resultToLanguageApiGraphResultToLanguageGetParams = {
    task_id: string;
    result_node_id: string;
  };

  type getReportApiReportsTaskIdGetParams = {
    task_id: string;
  };

  type getTaskApiTasksTaskIdGetParams = {
    task_id: string;
  };

  type HTTPValidationError = {
    /** Detail */
    detail?: ValidationError[];
  };

  type HumanApprovalDecisionRead = {
    /** Interaction Id */
    interaction_id: string;
    /** Approved */
    approved: boolean;
    /** Timed Out */
    timed_out?: boolean;
    /** Decided By */
    decided_by?: string;
    /** Message */
    message?: string;
    /** Timeout Seconds */
    timeout_seconds?: number;
  };

  type HumanApprovalDecisionRequest = {
    /** Approved */
    approved?: boolean;
    /** Operator */
    operator?: string;
    /** Message */
    message?: string | null;
  };

  type listChainsApiChainsGetParams = {
    /** 漏洞 ID */
    finding_id: string;
  };

  type listEventsApiEventsGetParams = {
    task_id: string;
    /** 当前已加载的最后一条事件 id；不传则拉取首批，传则只返回 id 更大的新事件 */
    after_id?: number;
  };

  type listFindingsApiFindingsGetParams = {
    project_id?: string | null;
    task_id?: string | null;
    keyword?: string | null;
    severity?: string | null;
    status?: string | null;
    current?: number;
    pageSize?: number;
  };

  type listLogsApiLogsGetParams = {
    level?: string | null;
    task_id?: string | null;
    keyword?: string | null;
    current?: number;
    pageSize?: number;
  };

  type listProjectsApiProjectsGetParams = {
    name?: string | null;
    keyword?: string | null;
    current?: number;
    pageSize?: number;
  };

  type listTasksApiTasksGetParams = {
    project_id?: string | null;
    status?: string | null;
    current?: number;
    pageSize?: number;
  };

  type LLMConfigUpdate = {
    /** Llm Provider */
    LLM_provider?: string | null;
    /** Llm Key */
    LLM_key?: string | null;
    /** Llm Model */
    LLM_model?: string | null;
    /** Llm Baseurl */
    LLM_baseurl?: string | null;
  };

  type ChangePasswordRequest = {
    /** Old Password */
    old_password: string;
    /** New Password */
    new_password: string;
  };

  type LoginRequest = {
    /** Username */
    username: string;
    /** Password */
    password: string;
  };

  type LoginResponse = {
    /** Success */
    success?: boolean;
    /** Token */
    token: string;
    /** Username */
    username: string;
    /** Display Name */
    display_name?: string;
  };

  type LogRead = {
    /** Id */
    id: string;
    /** Created At */
    created_at: string;
    /** Level */
    level: string;
    /** Module */
    module: string;
    /** Task Id */
    task_id?: string | null;
    /** Message */
    message: string;
  };

  type OkResponseAny_ = {
    /** Success */
    success?: boolean;
    /** Data */
    data?: any;
  };

  type OkResponseBool_ = {
    /** Success */
    success?: boolean;
    /** Data */
    data?: boolean | null;
  };

  type OkResponseCurrentUser_ = {
    /** Success */
    success?: boolean;
    data?: CurrentUser | null;
  };

  type OkResponseDict_ = {
    /** Success */
    success?: boolean;
    /** Data */
    data?: Record<string, any> | null;
  };

  type OkResponseEventRead_ = {
    /** Success */
    success?: boolean;
    data?: EventRead | null;
  };

  type OkResponseFindingRead_ = {
    /** Success */
    success?: boolean;
    data?: FindingRead | null;
  };

  type OkResponseHumanApprovalDecisionRead_ = {
    /** Success */
    success?: boolean;
    data?: HumanApprovalDecisionRead | null;
  };

  type OkResponseList_ = {
    /** Success */
    success?: boolean;
    /** Data */
    data?: any[] | null;
  };

  type OkResponseProjectRead_ = {
    /** Success */
    success?: boolean;
    data?: ProjectRead | null;
  };

  type OkResponseStr_ = {
    /** Success */
    success?: boolean;
    /** Data */
    data?: string | null;
  };

  type OkResponseTaskRead_ = {
    /** Success */
    success?: boolean;
    data?: TaskRead | null;
  };

  type PageResultEventRead_ = {
    /** Data */
    data: EventRead[];
    /** Total */
    total: number;
    /** Success */
    success?: boolean;
  };

  type PageResultFindingRead_ = {
    /** Data */
    data: FindingRead[];
    /** Total */
    total: number;
    /** Success */
    success?: boolean;
  };

  type PageResultLogRead_ = {
    /** Data */
    data: LogRead[];
    /** Total */
    total: number;
    /** Success */
    success?: boolean;
  };

  type PageResultProjectRead_ = {
    /** Data */
    data: ProjectRead[];
    /** Total */
    total: number;
    /** Success */
    success?: boolean;
  };

  type PageResultTaskRead_ = {
    /** Data */
    data: TaskRead[];
    /** Total */
    total: number;
    /** Success */
    success?: boolean;
  };

  type ProjectRead = {
    /** Name */
    name: string;
    /** Path */
    path: string;
    /** Description */
    description?: string;
    /** Description Compact */
    description_compact?: string;
    /** Project Uuid */
    project_uuid: string;
    /** Source Type */
    source_type: "git" | "upload" | "path";
    /** Source Git Url */
    source_git_url?: string | null;
    /** Source Git Branch */
    source_git_branch?: string | null;
    /** Source Path */
    source_path?: string | null;
    /** Storage Path */
    storage_path?: string;
    /** Id */
    id: string;
    /** File Count */
    file_count?: number;
    /** Line Count */
    line_count?: number;
    /** Language Stats */
    language_stats?: Record<string, any> | null;
    /** Created At */
    created_at: string;
    /** Updated At */
    updated_at: string;
  };

  type resolveHumanApprovalApiEventsHumanApprovalsInteractionIdPostParams = {
    interaction_id: string;
  };

  type runTaskEndpointApiTasksTaskIdRunPostParams = {
    task_id: string;
  };

  type TaskRead = {
    /** Id */
    id: string;
    /** Project Id */
    project_id: string;
    /** Name */
    name: string;
    /** Status */
    status: string;
    /** Todo */
    todo?: Record<string, any>[] | null;
    /** Llm Input Token */
    llm_input_token?: number;
    /** Llm Output Token */
    llm_output_token?: number;
    /** Code Agent Input Token */
    code_agent_input_token?: number;
    /** Code Agent Output Token */
    code_agent_output_token?: number;
    /** Error */
    error?: string;
    /** Created At */
    created_at: string;
    /** Finished At */
    finished_at?: string | null;
    /** Updated At */
    updated_at: string;
    /** Vuln Count */
    vulnCount?: number;
  };

  type TaskUpdate = {
    /** Name */
    name?: string | null;
    /** Status */
    status?: string | null;
    /** Error */
    error?: string | null;
  };

  type updateFindingApiFindingsFindingIdPutParams = {
    finding_id: string;
  };

  type updateFindingStatusApiFindingsFindingIdStatusPatchParams = {
    finding_id: string;
  };

  type updateTaskApiTasksTaskIdPutParams = {
    task_id: string;
  };

  type ValidationError = {
    /** Location */
    loc: (string | number)[];
    /** Message */
    msg: string;
    /** Error Type */
    type: string;
    /** Input */
    input?: any;
    /** Context */
    ctx?: Record<string, any>;
  };
}

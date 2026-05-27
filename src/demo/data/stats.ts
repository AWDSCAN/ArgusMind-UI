/** Dashboard 统计与趋势（合成展示数据，见 dashboard.ts） */
export {
  demoFindingsStats,
  demoFindingsStatsByType,
  demoFindingsStatsDaily,
  demoProjectsOverview,
  demoProjectsStats,
  demoTasksStats,
} from './dashboard';

/** 任务完成度仍来自真实任务快照（sync-demo-from-api） */
export const demoTaskCompletionStatus = {
  success: true as const,
  data: {
    task_id: 'b8b07d32-d7d5-4efa-8695-60d7e1250ff1',
    languages: [
      {
        node_id: 'cn_72fe311274db46bf',
        language: 'TypeScript',
        status: 'running',
        level: 1,
        risk_categories: [
          {
            node_id: '46544491393d48dfb35f12bc2b7c7271',
            category_name: 'idor',
            status: 'running',
            level: 1,
            sink_finder_completed: true,
          },
          {
            node_id: '81129cfc3d62475091a421703748d494',
            category_name: 'broken_access_control',
            status: 'pending',
            level: 2,
            sink_finder_completed: false,
          },
          {
            node_id: '9d5847616d004f0ca4a14dd353b1efc9',
            category_name: 'authentication_bypass',
            status: 'pending',
            level: 2,
            sink_finder_completed: false,
          },
          {
            node_id: '0ee0743325d34e8c902dc3cf7a1d65fb',
            category_name: 'xss',
            status: 'pending',
            level: 3,
            sink_finder_completed: false,
          },
          {
            node_id: '22faf353ef1e486a9c6d97fbfdeb8b29',
            category_name: 'insecure_deserialization',
            status: 'pending',
            level: 3,
            sink_finder_completed: false,
          },
          {
            node_id: 'd8fe3b52b619407580630d7f3b7e7727',
            category_name: 'sql_injection',
            status: 'pending',
            level: 3,
            sink_finder_completed: false,
          },
          {
            node_id: 'ebca732762284701964e5cc99f16e0b1',
            category_name: 'path_traversal',
            status: 'pending',
            level: 3,
            sink_finder_completed: false,
          },
          {
            node_id: 'a4ae2f86fb03401f9e7b1c2d2bd46d52',
            category_name: 'csv_injection',
            status: 'pending',
            level: 4,
            sink_finder_completed: false,
          },
          {
            node_id: 'b97a14a3c38b457fbcbeeb5a9e5762a6',
            category_name: 'session_fixation',
            status: 'pending',
            level: 4,
            sink_finder_completed: false,
          },
          {
            node_id: 'bdc68602d05b45dd85814db851d069bf',
            category_name: 'weak_password_hashing',
            status: 'pending',
            level: 4,
            sink_finder_completed: false,
          },
          {
            node_id: '4c0fae82ebb44303b3df90c2a6b2e56c',
            category_name: 'business_logic_vulnerability',
            status: 'pending',
            level: 5,
            sink_finder_completed: false,
          },
          {
            node_id: '9deb125b41954e75ada236bb55137603',
            category_name: 'mass_assignment',
            status: 'pending',
            level: 5,
            sink_finder_completed: false,
          },
          {
            node_id: '79819188292246f4a75be0bf57d51ba1',
            category_name: 'information_disclosure',
            status: 'pending',
            level: 6,
            sink_finder_completed: false,
          },
          {
            node_id: '91c50889c66f4ad8b22970325ade0212',
            category_name: 'unvalidated_redirect',
            status: 'pending',
            level: 6,
            sink_finder_completed: false,
          },
        ],
      },
    ],
  },
} as const;

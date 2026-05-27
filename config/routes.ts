/**
 * @name umi 的路由配置
 * @description ArgusMind：主导航（仪表盘、项目、任务、漏洞、配置）
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    component: './dashboard',
  },
  {
    path: '/projects',
    name: 'projects',
    icon: 'folder',
    component: './projects',
  },
  {
    path: '/projects/:id',
    hideInMenu: true,
    component: './projects/detail',
  },
  {
    path: '/tasks',
    name: 'tasks',
    icon: 'schedule',
    component: './tasks',
  },
  {
    path: '/tasks/:id',
    hideInMenu: true,
    component: './tasks/detail',
  },
  {
    path: '/vulnerabilities',
    name: 'vulnerabilities',
    icon: 'warning',
    component: './vulnerabilities',
  },
  {
    path: '/vulnerabilities/:id',
    hideInMenu: true,
    component: './vulnerabilities/detail',
  },
  {
    path: '/settings/ai',
    name: 'settings.ai',
    icon: 'setting',
    access: 'canConfigureAi',
    component: './settings/ai',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];

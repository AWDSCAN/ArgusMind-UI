import type { Request, Response } from 'express';

const waitTime = (time: number = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
};

async function getFakeCaptcha(_req: Request, res: Response) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

export const MOCK_TOKEN_USER = 'mock-jwt-user';

function hasValidAuth(req: Request): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return false;
  const t = auth.slice(7).trim();
  return t === MOCK_TOKEN_USER;
}

const singleUser = {
  username: 'ArgusMind',
  displayName: 'Administrator',
  name: 'Administrator',
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  userid: 'user-001',
  email: 'argusmind@argusmind.local',
  signature: 'ArgusMind User',
  title: 'User',
  group: '安全运营',
  access: 'user' as const,
  tags: [{ key: '0', label: 'user' }],
  notifyCount: 0,
  unreadCount: 0,
  country: 'China',
  address: '—',
  phone: '—',
};

export default {
  'GET /api/currentUser': (req: Request, res: Response) => {
    if (!hasValidAuth(req)) {
      res.status(401).send({
        data: { isLogin: false },
        errorCode: '401',
        errorMessage: '请先登录！',
        success: false,
      });
      return;
    }
    res.send({
      success: true,
      data: singleUser,
    });
  },
  'GET /api/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ],
  'POST /api/auth/login': async (req: Request, res: Response) => {
    const { password, username } = req.body;
    await waitTime(200);
    if (password === 'ArgusMind' && username === 'ArgusMind') {
      res.send({
        success: true,
        token: MOCK_TOKEN_USER,
        username: 'ArgusMind',
        display_name: 'Administrator',
      });
      return;
    }
    res.send({
      success: false,
      code: 'unauthorized',
      message: '用户名或密码错误',
    });
  },
  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, username } = req.body;
    await waitTime(200);
    if (password === 'ArgusMind' && username === 'ArgusMind') {
      res.send({
        success: true,
        token: MOCK_TOKEN_USER,
        username: 'ArgusMind',
        display_name: 'Administrator',
      });
      return;
    }
    res.status(401).send({
      success: false,
      code: 'unauthorized',
      message: '用户名或密码错误',
    });
  },
  'POST /api/auth/logout': (_req: Request, res: Response) => {
    res.send({ data: {}, success: true });
  },
  'POST /api/login/outLogin': (_req: Request, res: Response) => {
    res.send({ data: {}, success: true });
  },
  'POST /api/register': (_req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user', success: true });
  },
  'GET /api/500': (_req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (_req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (_req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (_req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET  /api/login/captcha': getFakeCaptcha,
};

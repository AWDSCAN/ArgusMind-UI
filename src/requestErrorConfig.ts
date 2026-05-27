import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import {
  ARGUS_MUST_CHANGE_PASSWORD_KEY,
  ARGUS_TOKEN_KEY,
  ARGUS_USER_KEY,
} from '@/constants/storage';
import { isDemoMode, resolveDemoMock } from '@/demo';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const loginPath = '/user/login';

const redirectToLogin = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ARGUS_TOKEN_KEY);
    localStorage.removeItem(ARGUS_USER_KEY);
    localStorage.removeItem(ARGUS_MUST_CHANGE_PASSWORD_KEY);
  }
  if (history.location.pathname !== loginPath) {
    history.push(loginPath);
  }
};

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          if (errorCode === 401) {
            redirectToLogin();
            return;
          }
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        if (error.response.status === 401) {
          redirectToLogin();
          return;
        }
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器：Demo 模式走本地 Mock；否则携带 Bearer
  requestInterceptors: [
    (config: RequestOptions) => {
      if (isDemoMode()) {
        const mockBody = resolveDemoMock(config);
        if (mockBody !== undefined) {
          config.adapter = ((cfg) =>
            Promise.resolve({
              data: mockBody,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: cfg,
              request: {},
            })) as RequestOptions['adapter'];
          return config;
        }
      }

      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(ARGUS_TOKEN_KEY)
          : null;
      if (!token) return config;
      const headers = {
        ...(config.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
      };
      return { ...config, headers };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;
      const skipGlobalError =
        (response as any)?.config?.skipErrorHandler === true;
      if (response.status === 401) {
        redirectToLogin();
        return response;
      }

      if (!skipGlobalError && data?.success === false) {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};

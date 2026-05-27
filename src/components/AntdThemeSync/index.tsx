import { useAntdConfigSetter, useModel } from '@umijs/max';
import { theme } from 'antd';
import { useLayoutEffect, useRef } from 'react';

/**
 * 将 ProLayout / SettingDrawer 的 navTheme 同步到 antd ConfigProvider（算法 + CSS 变量），
 * 并设置 html[data-theme]，供 global.less 中卡片等样式使用。
 *
 * 注意：Umi 的 setAntdConfig 在 AntdProvider 每次渲染时都是新函数引用，不能放进 effect 依赖，
 * 否则会与 cleanup 叠加触发「Maximum update depth exceeded」。
 */
function AntdThemeSync() {
  const { initialState } = useModel('@@initialState');
  const setAntdConfig = useAntdConfigSetter();
  const navTheme = initialState?.settings?.navTheme;

  const setAntdRef = useRef(setAntdConfig);
  setAntdRef.current = setAntdConfig;

  useLayoutEffect(() => {
    const isDark =
      navTheme === 'realDark' || (navTheme as string | undefined) === 'dark';
    setAntdRef.current({
      theme: {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      },
    });
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
  }, [navTheme]);

  useLayoutEffect(() => {
    return () => {
      setAntdRef.current({
        theme: {
          algorithm: theme.defaultAlgorithm,
        },
      });
      document.documentElement.setAttribute('data-theme', 'light');
    };
  }, []);

  return null;
}

export default AntdThemeSync;

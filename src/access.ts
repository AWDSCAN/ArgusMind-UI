/**
 * @see https://umijs.org/docs/max/access#access
 * ArgusMind：当前为单一权限模型，登录即拥有系统功能访问权限
 */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const isLogin = Boolean(currentUser);
  return {
    canAdmin: isLogin,
    canConfigureAi: isLogin,
  };
}

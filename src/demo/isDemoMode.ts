declare const __ARGUSMIND_DEMO__: boolean | undefined;

/** Vercel / 静态 Demo 构建时设置 UMI_APP_DEMO=1 */
export function isDemoMode(): boolean {
  return typeof __ARGUSMIND_DEMO__ !== 'undefined' && __ARGUSMIND_DEMO__;
}

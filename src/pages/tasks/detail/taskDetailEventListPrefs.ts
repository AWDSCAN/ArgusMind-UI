const STORAGE_KEY = 'argusmind-task-detail-events-auto-scroll-on-refresh';

/** 未写入 localStorage 时默认开启；仅当存为 `'false'` 时关闭 */
export function readEventListAutoScrollOnRefresh(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return true;
  }
  return window.localStorage.getItem(STORAGE_KEY) !== 'false';
}

export function writeEventListAutoScrollOnRefresh(value: boolean): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
}

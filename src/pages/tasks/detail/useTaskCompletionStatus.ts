import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTaskCompletionStatus } from '@/services/tasks';
import type { TaskCompletionStatusData } from '@/types/taskCompletionStatus';
import { countCompletionProgress } from './taskCompletionStatusUi';

export function useTaskCompletionStatus(taskId: string | undefined) {
  const [data, setData] = useState<TaskCompletionStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!taskId) {
        setData(null);
        setError(false);
        return;
      }
      const silent = Boolean(options?.silent);
      if (!silent) setLoading(true);
      try {
        const res = await getTaskCompletionStatus(taskId);
        if (res.success && res.data) {
          setData(res.data);
          setError(false);
        } else {
          setData(null);
          setError(true);
        }
      } catch {
        setData(null);
        setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [taskId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const progress = useMemo(
    () => countCompletionProgress(data?.languages ?? []),
    [data?.languages],
  );

  return { data, loading, error, progress, reload: load };
}

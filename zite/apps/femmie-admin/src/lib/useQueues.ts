import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listQueues, reviewAction, type ListQueuesOutputType, type ReviewActionInputType } from 'zitejs/api';

export function useQueues() {
  const [data, setData] = useState<ListQueuesOutputType | null>(null);
  const load = useCallback(() => listQueues({}).then(setData).catch(() => toast.error('Could not load')), []);
  useEffect(() => { load(); }, [load]);
  const act = async (input: ReviewActionInputType) => {
    try { await reviewAction(input); toast.success(`Marked ${input.status}`); load(); } catch { toast.error('Action failed'); }
  };
  return { data, act };
}

import { useEffect } from 'react';
import { syncRemoteReportsFromSupabase } from '@/lib/relativeReports';

const POLL_MS = 8000;

/** Poll Supabase moi 8s, tu dong merge report moi vao local storage. */
export function useRemoteReportsSync(onSynced?: () => void) {
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      await syncRemoteReportsFromSupabase();
      if (!cancelled) onSynced?.();
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [onSynced]);
}
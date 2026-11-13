import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyChairDevice } from '@/lib/api';
import type { Chair } from '@/types';

/**
 * Loads this device's Chair doc and re-fetches it every `pollMs` (there is no
 * subscribeChair API yet, so name/volume/memberUids changes are picked up by polling).
 */
export function useChairDevice(pollMs = 60_000) {
  const [chair, setChair] = useState<Chair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const c = await getMyChairDevice();
      if (!mounted.current) return;
      setChair(c);
      setError(null);
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh, pollMs]);

  return { chair, loading, error, refresh };
}

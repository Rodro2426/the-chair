import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyChairDevice, subscribeChair } from '@/lib/api';
import type { Chair } from '@/types';

/**
 * Loads this device's Chair doc, then keeps it live via subscribeChair (name, volume,
 * memberUids, pairing). `chair === null && !loading` means this device isn't registered.
 * A null/errored snapshot keeps the last known chair, so a network blip never bounces
 * the grandparent back to setup.
 */
export function useChairDevice() {
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
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const chairId = chair?.id;
  useEffect(() => {
    if (!chairId) return;
    try {
      return subscribeChair(chairId, (c) => {
        if (c && mounted.current) setChair(c);
      });
    } catch (e) {
      console.warn('[chair] subscribeChair failed', e);
    }
  }, [chairId]);

  return { chair, loading, error, refresh };
}

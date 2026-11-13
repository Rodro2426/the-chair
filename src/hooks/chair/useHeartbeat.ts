import { useEffect } from 'react';
import { heartbeat } from '@/lib/api';

export const HEARTBEAT_MS = 60_000;

/** Sends heartbeat(chairId) immediately and then every 60s while mounted. */
export function useHeartbeat(chairId: string | null | undefined) {
  useEffect(() => {
    if (!chairId) return;
    const beat = () => heartbeat(chairId).catch((e) => console.warn('[chair] heartbeat failed', e));
    beat();
    const id = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [chairId]);
}

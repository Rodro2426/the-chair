import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { ChairMessage } from '@/types';

/** Live conversation for a chair, newest first. */
export function useMessages(chairId: string | undefined, limit?: number) {
  const [messages, setMessages] = useState<ChairMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chairId) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    let unsub: (() => void) | undefined;
    try {
      unsub = api.subscribeMessages(chairId, (m) => { setMessages(m); setLoading(false); setError(null); }, limit);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
    return () => unsub?.();
  }, [chairId, limit]);

  return { messages, loading, error };
}

/** Whether a photo of the day was already sent today. Re-checks when `bump` changes. */
export function usePhotoSentToday(chairId: string | undefined, bump: unknown) {
  const [sent, setSent] = useState<boolean | null>(null);
  useEffect(() => {
    if (!chairId) return;
    let alive = true;
    api.hasSentPhotoToday(chairId).then((v) => alive && setSent(v)).catch(() => alive && setSent(false));
    return () => { alive = false; };
  }, [chairId, bump]);
  return sent;
}

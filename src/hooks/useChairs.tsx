import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '@/lib/api';
import type { Chair } from '@/types';

const KEY = 'thechair.selectedChairId';

interface ChairsState {
  chairs: Chair[];
  loading: boolean;
  error: string | null;
  selected: Chair | null;
  select: (chairId: string) => void;
}

const ChairsCtx = createContext<ChairsState>({ chairs: [], loading: true, error: null, selected: null, select: () => {} });

/** Live list of the signed-in family member's chairs + the currently selected one (persisted). */
export function ChairsProvider({ children, uid }: { children: ReactNode; uid: string }) {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setSelectedId((cur) => cur ?? v)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let unsub: (() => void) | undefined;
    try {
      unsub = api.subscribeMyChairs((list) => { setChairs(list); setLoading(false); setError(null); });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
    return () => unsub?.();
  }, [uid]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    AsyncStorage.setItem(KEY, id).catch(() => {});
  }, []);

  const selected = useMemo(
    () => chairs.find((c) => c.id === selectedId) ?? chairs[0] ?? null,
    [chairs, selectedId],
  );

  const value = useMemo(() => ({ chairs, loading, error, selected, select }), [chairs, loading, error, selected, select]);
  return <ChairsCtx.Provider value={value}>{children}</ChairsCtx.Provider>;
}

export function useChairs() { return useContext(ChairsCtx); }

export function useChair(chairId: string | undefined) {
  const { chairs } = useChairs();
  return chairs.find((c) => c.id === chairId) ?? null;
}

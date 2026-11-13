import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '@/lib/api';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  /** Locally patch the profile (e.g. after updateDisplayName) until the backend pushes a fresh one. */
  patchUser: (patch: Partial<UserProfile>) => void;
}

const AuthCtx = createContext<AuthState>({ user: null, loading: true, patchUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = api.onAuthChanged((u) => { setUser(u); setLoading(false); });
    } catch (e) {
      console.warn('[auth] onAuthChanged failed', e);
      setLoading(false);
    }
    return () => unsub?.();
  }, []);

  const patchUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const value = useMemo(() => ({ user, loading, patchUser }), [user, loading, patchUser]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }

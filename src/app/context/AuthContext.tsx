import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, type AuthUser } from '../services/wpAuth';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (input: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  requestPassword: (email: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => { (async () => { await refreshMe(); setLoading(false); })(); }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    setUser(user);
  }, []);

  const register = useCallback(async (input: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const { user } = await authApi.register(input);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: { firstName?: string; lastName?: string; phone?: string }) => {
    await authApi.updateProfile(input);
    await refreshMe();
  }, [refreshMe]);

  const requestPassword = useCallback(async (email: string) => { await authApi.requestPassword(email); }, []);

  const value = useMemo(() => ({ user, loading, login, logout, register, refreshMe, updateProfile, requestPassword }),
    [user, loading, login, logout, register, refreshMe, updateProfile, requestPassword]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

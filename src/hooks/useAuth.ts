import { useState, useEffect, useCallback } from 'react';
import { authMe, authLogin, authRegister, authLogout, User } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const refresh = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    const user = await authMe();
    setState({ user, loading: false });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authLogin(email, password);
    setState({ user, loading: false });
    return user;
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const user = await authRegister(email, username, password);
    setState({ user, loading: false });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setState({ user: null, loading: false });
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    isAdmin: state.user?.role === 'admin',
    login,
    register,
    logout,
    refresh,
  };
}

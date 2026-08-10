import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((data) => { setUser(data.user); setAccessToken(data.accessToken); return data.user; }, []);
  const refreshSession = useCallback(async () => {
    try { const data = await authService.refresh(); applySession(data); return data; }
    catch { setUser(null); setAccessToken(null); return null; }
  }, [applySession]);

  useEffect(() => { refreshSession().finally(() => setIsLoading(false)); }, [refreshSession]);

  const login = useCallback(async (input) => applySession(await authService.login(input)), [applySession]);
  const register = useCallback(async (input) => applySession(await authService.register(input)), [applySession]);
  const logout = useCallback(async () => { try { await authService.logout(); } finally { setUser(null); setAccessToken(null); } }, []);
  const request = useCallback(async (path, options = {}) => {
    try { return await apiRequest(path, options, accessToken); }
    catch (error) {
      if (error.status !== 401) throw error;
      const refreshed = await refreshSession();
      if (!refreshed) throw error;
      return apiRequest(path, options, refreshed.accessToken);
    }
  }, [accessToken, refreshSession]);
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), isLoading, login, register, logout, refreshSession, request, setUser }), [user, isLoading, login, register, logout, refreshSession, request]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider'); return context; }
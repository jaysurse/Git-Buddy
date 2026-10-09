import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [checking, setChecking] = useState(Boolean(authService.getStoredToken()));

  // Verify a stored session with the server on app start
  useEffect(() => {
    let cancelled = false;
    const stored = authService.getStoredToken();
    if (!stored) return undefined;
    authService
      .me(stored)
      .then((freshUser) => {
        if (!cancelled) {
          setUser(freshUser);
          authService.saveSession(stored, freshUser);
        }
      })
      .catch((err) => {
        // Only log out when the server explicitly rejects the token
        if (!cancelled && err?.status === 401) {
          authService.clearSession();
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => !cancelled && setChecking(false));
    return () => { cancelled = true; };
  }, []);

  const startSession = useCallback(({ user: u, token: t }) => {
    authService.saveSession(t, u);
    setUser(u);
    setToken(t);
    return u;
  }, []);

  const login = useCallback(async (email, password) => startSession(await authService.login(email, password)), [startSession]);
  const register = useCallback(async (name, email, password) => startSession(await authService.register(name, email, password)), [startSession]);
  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(user && token), checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;

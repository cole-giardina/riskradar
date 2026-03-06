import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { auth as authApi, users } from '../lib/api';
import type { User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ needs2FA?: boolean; pendingToken?: string } | void>;
  verify2FA: (code: string, pendingToken: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    users
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.needs_2fa && res.pending_token) {
      return { needs2FA: true, pendingToken: res.pending_token };
    }
    if (res.access_token && res.user) {
      localStorage.setItem('token', res.access_token);
      setUser(res.user);
    }
  };

  const verify2FA = async (code: string, pendingToken: string) => {
    const { access_token, user: u } = await authApi.verify2FA(code, pendingToken);
    localStorage.setItem('token', access_token);
    setUser(u);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const { access_token, user: u } = await authApi.register(email, password, displayName);
    localStorage.setItem('token', access_token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

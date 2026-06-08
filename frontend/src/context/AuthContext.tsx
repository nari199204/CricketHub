import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type User = { id: number; email: string; name: string; role: string };
type Ctx = {
  user: User | null;
  token: string | null;
  login: (e: string, p: string) => Promise<void>;
  register: (e: string, p: string, n: string, r: string) => Promise<void>;
  logout: () => void;
};
const AuthCtx = createContext<Ctx>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };
  const register = async (email: string, password: string, name: string, role: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };
  return <AuthCtx.Provider value={{ user, token, login, register, logout }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);

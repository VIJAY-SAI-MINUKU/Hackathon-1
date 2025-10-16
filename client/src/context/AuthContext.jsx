import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null));

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    setToken(res.token);
    setUser(res.user);
  };

  const loginDemo = async (role = 'teacher') => {
    const email = role === 'teacher' ? 'teacher@example.com' : 'student@example.com';
    const password = 'password123';
    return login(email, password);
  };

  const logout = () => { setToken(null); setUser(null); };

  const value = useMemo(() => ({ token, user, login, register, logout, loginDemo }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }

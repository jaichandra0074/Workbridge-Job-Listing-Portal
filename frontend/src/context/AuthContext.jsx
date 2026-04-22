import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('wb_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('wb_token'); localStorage.removeItem('wb_user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('wb_token', token);
    localStorage.setItem('wb_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    const { token, user } = res.data;
    localStorage.setItem('wb_token', token);
    localStorage.setItem('wb_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wb_token');
    localStorage.removeItem('wb_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getMe();
    setUser(res.data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

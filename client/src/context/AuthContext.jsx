import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vanguard_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check current user
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('vanguard_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('vanguard_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('vanguard_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.token) {
      localStorage.setItem('vanguard_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('vanguard_token');
    setToken(null);
    setUser(null);
  };

  const demoSwitch = async (roleKey) => {
    try {
      const res = await api.post(`/auth/demo-login/${roleKey}`);
      if (res.token) {
        localStorage.setItem('vanguard_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      console.error('Demo switch failed:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  const isStaff = user && ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'].includes(user.role);
  const isEditor = user && ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR'].includes(user.role);
  const isChief = user && ['SUPER_ADMIN', 'CHIEF_EDITOR'].includes(user.role);
  const isAdmin = user && user.role === 'SUPER_ADMIN';

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    demoSwitch,
    refreshUser,
    isStaff,
    isEditor,
    isChief,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

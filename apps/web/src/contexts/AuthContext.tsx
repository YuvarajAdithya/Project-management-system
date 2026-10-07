import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { User, AuthResponse } from '../types';
import { getApiErrorMessage } from '../lib/apiError';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch (error) {
          setAuthError(getApiErrorMessage(error, 'Failed to restore your session. Please log in again.'));
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setAuthError('');
    const res = await api.post<AuthResponse>('/auth/login', { email: email.trim().toLowerCase(), password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    setAuthError('');
    const res = await api.post<AuthResponse>('/auth/register', {
      fullName: fullName.trim(), email: email.trim().toLowerCase(), password,
    });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {} // ignore error on logout
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

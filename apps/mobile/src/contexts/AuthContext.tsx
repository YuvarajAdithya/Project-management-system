import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';
import { getApiErrorMessage, SESSION_EXPIRED_MESSAGE } from '../lib/apiError';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionMessage: string | null;
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const logoutPromise = useRef<Promise<void> | null>(null);
  const clearPromise = useRef<Promise<void> | null>(null);

  const clearSession = useCallback((expired = false) => {
    // Clear synchronously so concurrent 401s cannot start another expiry.
    tokenRef.current = null;
    setUser(null);
    setSessionMessage(expired ? SESSION_EXPIRED_MESSAGE : null);
    if (!clearPromise.current) {
      clearPromise.current = SecureStore.deleteItemAsync('token').finally(() => {
        clearPromise.current = null;
      });
    }
    // RootLayoutNav redirects after its navigator mounts, including at startup.
    return clearPromise.current;
  }, []);

  useEffect(() => {
    let active = true;
    // Register before /auth/me so restoration also uses local-only expiration.
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          const path = error.config?.url?.split('?')[0].replace(/\/$/, '');
          const isAuthAction = ['/auth/login', '/auth/register', '/auth/logout'].includes(path || '');
          const requestToken = error.config?.headers?.Authorization;
          if (active && !isAuthAction && tokenRef.current && requestToken === `Bearer ${tokenRef.current}`) {
            try {
              await clearSession(true);
            } catch {
              setSessionMessage(`${SESSION_EXPIRED_MESSAGE} Unable to remove the saved token from this device.`);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!active) return;
        tokenRef.current = token;
        if (token) {
          const response = await api.get<User>('/auth/me');
          if (active && tokenRef.current === token) setUser(response.data);
        }
      } catch (error) {
        // A temporary connection/server failure must not delete a valid token.
        if (active && !(axios.isAxiosError(error) && error.response?.status === 401)) {
          setSessionMessage(getApiErrorMessage(error, 'Unable to restore your session. Please try again.'));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadUser();
    return () => {
      active = false;
      api.interceptors.response.eject(interceptor);
    };
  }, [clearSession]);

  const login = async (token: string, nextUser: User) => {
    // Finish an earlier deletion before saving a newly authenticated session.
    if (clearPromise.current) await clearPromise.current;
    // Ignore late 401s from the previous token while SecureStore is writing.
    tokenRef.current = token;
    try {
      await SecureStore.setItemAsync('token', token);
    } catch (error) {
      tokenRef.current = null;
      throw error;
    }
    setSessionMessage(null);
    setUser(nextUser);
  };

  const logout = () => {
    if (logoutPromise.current) return logoutPromise.current;
    const token = tokenRef.current;
    logoutPromise.current = (async () => {
      try {
        if (token) await api.post('/auth/logout');
      } catch {
        // Logging out still clears local credentials when the API is unavailable.
      } finally {
        if (tokenRef.current === token) await clearSession();
      }
    })().finally(() => {
      logoutPromise.current = null;
    });
    return logoutPromise.current;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, sessionMessage, login, register: login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

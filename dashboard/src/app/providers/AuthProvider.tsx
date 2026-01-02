/**
 * Auth Provider
 * Manages authentication state and auto-login for development
 */

import { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { authApi } from '../../shared/api/services/auth';
import { apiClient } from '../../shared/api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

  // Auto-login in development mode
  useEffect(() => {
    const autoLogin = async () => {
      // Check if we already have a token
      const existingToken = localStorage.getItem('auth_token');
      if (existingToken) {
        apiClient.setToken(existingToken);
        try {
          const response = await authApi.getMe();
          if (response.success) {
            setIsAuthenticated(true);
            setUser(response.data);
            return;
          }
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
        }
      }

      // Auto-login with default dev credentials
      if (import.meta.env.DEV) {
        try {
          const response = await authApi.login({
            email: 'admin@example.com',
            password: 'dev', // Password is ignored in MVP
          });
          if (response.success) {
            apiClient.setToken(response.data.token);
            setIsAuthenticated(true);
            setUser(response.data.user);
          }
        } catch (error) {
          console.warn('Auto-login failed. Make sure database is seeded:', error);
        }
      }
    };

    autoLogin();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success) {
      apiClient.setToken(response.data.token);
      setIsAuthenticated(true);
      setUser(response.data.user);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


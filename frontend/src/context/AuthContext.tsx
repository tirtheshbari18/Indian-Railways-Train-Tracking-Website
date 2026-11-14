import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('railway_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
        } catch (err) {
          console.error("Token expired or invalid:", err);
          localStorage.removeItem('railway_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const handleAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem('railway_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const login = async (data: { email: string; password: string }) => {
    const res = await api.auth.login(data);
    handleAuthSuccess(res);
  };

  const register = async (data: { email: string; password: string; full_name?: string }) => {
    const res = await api.auth.register(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    localStorage.removeItem('railway_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

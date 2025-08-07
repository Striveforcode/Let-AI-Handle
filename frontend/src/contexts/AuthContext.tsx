import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, authUtils, userAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, countryCode: string, otp: string) => Promise<void>;
  register: (phoneNumber: string, countryCode: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authUtils.isAuthenticated()) {
          const response = await userAPI.getProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authUtils.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phoneNumber: string, countryCode: string, otp: string) => {
    try {
      const response = await authAPI.loginVerify(phoneNumber, countryCode, otp);
      const { accessToken, refreshToken, user: userData } = response.data;
      
      authUtils.setTokens(accessToken, refreshToken);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (phoneNumber: string, countryCode: string, otp: string) => {
    try {
      const response = await authAPI.registerVerify(phoneNumber, countryCode, otp);
      const { accessToken, refreshToken, user: userData } = response.data;
      
      authUtils.setTokens(accessToken, refreshToken);
      setUser(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      authUtils.clearTokens();
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

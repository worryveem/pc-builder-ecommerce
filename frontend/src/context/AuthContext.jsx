import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication from localStorage upon initialization
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to restore authentication:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password });
      if (response && response.success && response.data) {
        const authData = response.data;
        const authToken = authData.token;
        const userInfo = {
          userId: authData.userId,
          username: authData.username,
          fullName: authData.fullName,
          role: authData.role
        };

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userInfo));

        setToken(authToken);
        setUser(userInfo);

        return { success: true, message: response.message || 'Đăng nhập thành công' };
      } else {
        return { success: false, message: response?.message || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Lỗi hệ thống khi đăng nhập';
      return { success: false, message: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return {
        success: response.success,
        message: response.message || (response.success ? 'Đăng ký thành công' : 'Đăng ký thất bại')
      };
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Lỗi hệ thống khi đăng ký';
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (_) {}
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    const { token: t, ...userData } = res.data;
    await AsyncStorage.setItem('token', t);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password);
    const { token: t, ...userData } = res.data;
    await AsyncStorage.setItem('token', t);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      const updated = res.data;
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

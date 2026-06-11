// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, profileService } from '../services/appwrite';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const cachedUser = await AsyncStorage.getItem('user');
      if (token && cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        setSessionToken(token);
        setUser(parsedUser);
        // Verify token is still valid
        const freshUser = await authService.getAccount(token);
        setUser(freshUser);
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        // Load profile
        const userProfile = await profileService.getProfile(freshUser.$id, token);
        setProfile(userProfile);
      }
    } catch (err) {
      // Session expired — clear storage
      await AsyncStorage.multiRemove(['sessionToken', 'user']);
      setUser(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const session = await authService.login(email, password);
    const token = session.$id;
    const userData = await authService.getAccount(token);
    const userProfile = await profileService.getProfile(userData.$id, token);

    setSessionToken(token);
    setUser(userData);
    setProfile(userProfile);

    await AsyncStorage.setItem('sessionToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const register = async (email, password, name) => {
    await authService.register(email, password, name);
    return login(email, password);
  };

  const logout = async () => {
    try {
      if (sessionToken) await authService.logout(sessionToken);
    } catch (_) {}
    setUser(null);
    setProfile(null);
    setSessionToken(null);
    await AsyncStorage.multiRemove(['sessionToken', 'user']);
  };

  const refreshProfile = async () => {
    if (user && sessionToken) {
      const userProfile = await profileService.getProfile(user.$id, sessionToken);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, sessionToken, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

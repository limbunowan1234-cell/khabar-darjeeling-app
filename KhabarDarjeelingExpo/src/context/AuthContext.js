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

  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      if (token) {
        const freshUser = await authService.getAccount(token);
        setSessionToken(token);
        setUser(freshUser);
        const userProfile = await profileService.getProfile(freshUser.$id, token);
        setProfile(userProfile);
      }
    } catch {
      await AsyncStorage.multiRemove(['sessionToken', 'user']);
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
    return userData;
  };

  const register = async (email, password, name) => {
    await authService.register(email, password, name);
    return login(email, password);
  };

  const logout = async () => {
    try { if (sessionToken) await authService.logout(sessionToken); } catch {}
    setUser(null); setProfile(null); setSessionToken(null);
    await AsyncStorage.multiRemove(['sessionToken', 'user']);
  };

  const refreshProfile = async () => {
    if (user && sessionToken) {
      const p = await profileService.getProfile(user.$id, sessionToken);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, sessionToken, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

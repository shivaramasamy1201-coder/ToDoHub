import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Restoration
    authService.getCurrentSession().then(({ session }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // 2. Auth State Change Listener
    const subscription = authService.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const register = async (fullName, email, password) => {
    return await authService.registerUser(fullName, email, password);
  };

  const login = async (email, password) => {
    return await authService.loginUser(email, password);
  };

  const logout = async () => {
    const res = await authService.logoutUser();
    if (res.success) {
      setUser(null);
      setSession(null);
    }
    return res;
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

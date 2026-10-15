import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tavyn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tavyn_token'));
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('tavyn_user', JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Session expired or invalid', err);
      logout();
      return null;
    }
  };

  useEffect(() => {
    async function initUser() {
      if (token) {
        await refreshProfile();
      }
      setLoading(false);
    }
    initUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('tavyn_token', data.token);
    setToken(data.token);
    // Fetch full profile with resolved effectivePermissions
    const profile = await authService.getProfile().catch(() => data);
    localStorage.setItem('tavyn_user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('tavyn_token');
    localStorage.removeItem('tavyn_user');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (menuKey) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const perms = user.effectivePermissions || user.permissions || {};
    return perms[menuKey] !== false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshProfile,
        loading,
        isAuthenticated: !!token,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

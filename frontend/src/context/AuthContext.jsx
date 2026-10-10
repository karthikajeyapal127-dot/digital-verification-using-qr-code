import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Check URL parameters immediately (for OAuth redirects to /dashboard?token=... or /admin?token=...)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const roleFromUrl = (params.get('role') || 'CREDENTIAL_HOLDER').toUpperCase();
    const nameFromUrl = params.get('name');
    if (tokenFromUrl) {
      localStorage.setItem('veriglass_token', tokenFromUrl);
      localStorage.setItem('veriglass_logged_in', 'true');
      const isAdminRole = roleFromUrl === 'ADMIN' || roleFromUrl === 'ORGANIZATION_ADMIN';
      localStorage.setItem('veriglass_is_admin', JSON.stringify(isAdminRole));

      const currentUser = localStorage.getItem('veriglass_user');
      if (!currentUser) {
        const initialUser = {
          name: nameFromUrl ? decodeURIComponent(nameFromUrl) : 'J. Karthika',
          email: 'karthikajeyapal127@gmail.com',
          role: roleFromUrl,
          holderType: 'STUDENT'
        };
        localStorage.setItem('veriglass_user', JSON.stringify(initialUser));
      }
    }
  }

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('veriglass_user');
    const token = localStorage.getItem('veriglass_token');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('veriglass_token');
    return !!token && localStorage.getItem('veriglass_logged_in') === 'true';
  });

  const [systemStatus, setSystemStatus] = useState({
    isInitialized: true,
    totalUsers: 0,
    hasAdmin: true
  });

  const refreshSystemStatus = async () => {
    try {
      const res = await authApi.getSystemStatus();
      if (res && res.success) {
        setSystemStatus({
          isInitialized: res.isInitialized,
          totalUsers: res.totalUsers,
          hasAdmin: res.hasAdmin
        });
      }
    } catch (e) {
      console.warn('[AuthContext] System status fetch error:', e);
    }
  };

  useEffect(() => {
    refreshSystemStatus();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('veriglass_user', JSON.stringify(user));
      const roleUpper = (user.role || '').toUpperCase();
      const isAdminRole = roleUpper === 'ADMIN' || roleUpper === 'ORGANIZATION_ADMIN';
      localStorage.setItem('veriglass_is_admin', JSON.stringify(isAdminRole));
    } else {
      localStorage.removeItem('veriglass_user');
      localStorage.removeItem('veriglass_is_admin');
    }
  }, [user]);

  const setAuthSession = (token, newUser) => {
    if (token) localStorage.setItem('veriglass_token', token);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('veriglass_user', JSON.stringify(newUser));
      const roleUpper = (newUser.role || '').toUpperCase();
      const isAdminRole = roleUpper === 'ADMIN' || roleUpper === 'ORGANIZATION_ADMIN';
      localStorage.setItem('veriglass_is_admin', JSON.stringify(isAdminRole));
    }
    localStorage.setItem('veriglass_logged_in', 'true');
    setIsLoggedIn(true);
    refreshSystemStatus();
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res && res.success && res.user) {
      setAuthSession(res.token, res.user);
      return { success: true, user: res.user };
    }
    throw new Error(res?.message || 'Incorrect email or password.');
  };

  const loginWithGoogle = async (googleProfileOrCredential) => {
    const res = await authApi.googleOAuth(googleProfileOrCredential);
    if (res && res.success && res.user) {
      setAuthSession(res.token, res.user);
      return { success: true, user: res.user };
    }
    throw new Error(res?.message || 'Google OAuth failed');
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res && res.success && res.user) {
        setAuthSession(res.token, res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      throw err;
    }
  };

  const setupInitialAdmin = async (adminData) => {
    try {
      const res = await authApi.setupAdmin(adminData);
      if (res && res.success && res.user) {
        setAuthSession(res.token, res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('veriglass_token');
    localStorage.removeItem('veriglass_user');
    localStorage.removeItem('veriglass_is_admin');
    localStorage.removeItem('veriglass_logged_in');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (updatedFields) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('veriglass_user', JSON.stringify(updated));
    }
  };

  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'ORGANIZATION_ADMIN';
  const isOrgAdmin = isAdmin;
  const isVerifier = roleUpper === 'VERIFIER';
  const isHolder = !isAdmin && !isVerifier && !!user;
  const isStudent = (user?.holderType || '').toUpperCase() === 'STUDENT' || roleUpper === 'STUDENT' || (isHolder && user?.holderType !== 'EMPLOYEE');

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        setAuthSession,
        isAdmin,
        isOrgAdmin,
        isVerifier,
        isHolder,
        isStudent,
        systemStatus,
        refreshSystemStatus,
        login,
        loginWithGoogle,
        register,
        setupInitialAdmin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

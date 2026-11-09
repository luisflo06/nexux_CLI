import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'nexus_cli_token';

// Security: strictly validate JWT format to prevent storage injection
function isValidToken(token) {
  if (typeof token !== 'string' || !token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => /^[A-Za-z0-9-_]+$/.test(part));
}

// Security: sanitize user profile to prevent prototype pollution or XSS
function sanitizeUserData(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const validRoles = ['root', 'admin', 'lead', 'engineer'];
  return {
    id: typeof rawUser.id === 'number' ? rawUser.id : Number(rawUser.id) || 0,
    username: String(rawUser.username || '').replace(/[^\w.-]/g, '').slice(0, 50),
    role: validRoles.includes(rawUser.role) ? rawUser.role : 'engineer',
    full_name: String(rawUser.full_name || '').slice(0, 100),
    email: String(rawUser.email || '').slice(0, 120),
    avatar_color: typeof rawUser.avatar_color === 'string' && /^#[0-9a-fA-F]{6}$/.test(rawUser.avatar_color)
      ? rawUser.avatar_color
      : '#10b981'
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return isValidToken(saved) ? saved : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('nexus_cli_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function verifyAuth() {
      if (token && isValidToken(token)) {
        try {
          const data = await authService.getMe();
          setUser(sanitizeUserData(data.user));
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    if (!isValidToken(data.token)) {
      throw new Error('Formato de token de sesion invalido.');
    }
    // Only persist the validated cryptographic token in storage
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(sanitizeUserData(data.user));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token && user), login, logout, loading }}>
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

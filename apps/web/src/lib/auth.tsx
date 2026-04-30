/* eslint-disable react-refresh/only-export-components */

import { createContext, startTransition, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'studio-vip-auth-v1';

const DEFAULT_OWNER_USERNAME = 'mr.jwswain@gmail.com';
const DEFAULT_OWNER_PASSCODE = '5555';

const OWNER_USERNAME = (import.meta.env.VITE_VAULT_USERNAME as string | undefined)?.trim() || DEFAULT_OWNER_USERNAME;
const OWNER_PASSCODE = (import.meta.env.VITE_VAULT_PASSCODE as string | undefined) ?? DEFAULT_OWNER_PASSCODE;

type AuthState = {
  isAuthenticated: boolean;
  ownerUsername: string;
  login: (username: string, passcode: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === '1';
  });

  const login = (email: string, passcode: string) => {
    const ok = email.trim().toLowerCase() === OWNER_USERNAME.toLowerCase() && passcode === OWNER_PASSCODE;
    if (!ok) {
      return false;
    }

    startTransition(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      setIsAuthenticated(true);
    });
    return true;
  };

  const logout = () => {
    startTransition(() => {
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, ownerUsername: OWNER_USERNAME, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

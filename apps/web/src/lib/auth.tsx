/* eslint-disable react-refresh/only-export-components */

import { createContext, startTransition, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'studio-vip-auth-v1';

const DEFAULT_OWNER_USERNAME = 'mr.jwswain@gmail.com';

const OWNER_USERNAME = (import.meta.env.VITE_VAULT_USERNAME as string | undefined)?.trim() || DEFAULT_OWNER_USERNAME;
const OWNER_PASSCODE_HASH = (import.meta.env.VITE_VAULT_PASSCODE_SHA256 as string | undefined)?.trim() ?? '';
const OWNER_SECRET_ANSWER_HASH = (import.meta.env.VITE_VAULT_SECRET_ANSWER_SHA256 as string | undefined)?.trim() ?? '';

type AuthState = {
  isAuthenticated: boolean;
  ownerUsername: string;
  login: (username: string, passcode: string, secretAnswer?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === '1';
  });

  const login = async (email: string, passcode: string, secretAnswer = '') => {
    if (!OWNER_PASSCODE_HASH || !OWNER_SECRET_ANSWER_HASH) {
      return false;
    }

    const [passcodeHash, secretHash] = await Promise.all([
      sha256(passcode),
      sha256(secretAnswer.trim().toLowerCase()),
    ]);

    const ok =
      email.trim().toLowerCase() === OWNER_USERNAME.toLowerCase() &&
      passcodeHash === OWNER_PASSCODE_HASH.toLowerCase() &&
      secretHash === OWNER_SECRET_ANSWER_HASH.toLowerCase();
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

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

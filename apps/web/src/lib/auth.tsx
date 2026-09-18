import { createContext, startTransition, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = '3000-owner-session-v1';

const DEFAULT_OWNER_USERNAME = 'mr.jwswain@gmail.com';

const OWNER_USERNAME =
  (import.meta.env.VITE_VAULT_USERNAME as string | undefined)?.trim() || DEFAULT_OWNER_USERNAME;
const API_BASE =
  import.meta.env.VITE_API_BASE?.toString() || 'https://apex-citadel-api.mr-jwswain.workers.dev';

type AuthState = {
  isAuthenticated: boolean;
  ownerUsername: string;
  token: string | null;
  login: (username: string, passcode: string, secretAnswer?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ isAuthenticated: boolean; token: string | null }>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { isAuthenticated: false, token: null };
      const parsed = JSON.parse(raw) as { token?: string; email?: string };
      if (parsed.token && parsed.email?.toLowerCase() === OWNER_USERNAME.toLowerCase()) {
        return { isAuthenticated: true, token: parsed.token };
      }
    } catch {
      /* ignore */
    }
    return { isAuthenticated: false, token: null };
  });

  const login = async (email: string, passcode: string, secretAnswer = '') => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, passcode, secretAnswer }),
    });
    if (!res.ok) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      startTransition(() => {
        setState({ isAuthenticated: false, token: null });
      });
      return false;
    }
    const data = (await res.json()) as { ok: boolean; token?: string; email?: string };
    if (!data.ok || !data.token) {
      startTransition(() => {
        setState({ isAuthenticated: false, token: null });
      });
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, email: data.email }));
    } catch {
      /* ignore */
    }
    startTransition(() => {
      setState({ isAuthenticated: true, token: data.token ?? null });
    });
    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    startTransition(() => {
      setState({ isAuthenticated: false, token: null });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        ownerUsername: OWNER_USERNAME,
        token: state.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getOwnerToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

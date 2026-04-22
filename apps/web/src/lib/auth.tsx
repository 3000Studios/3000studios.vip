import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'studio-vip-auth-v1';
const OWNER_EMAIL = 'mr.jwswain@gmail.com';
const OWNER_PASSCODE = '5555';
const SECRET_ANSWER = 'georgia';

type AuthState = {
  isAuthenticated: boolean;
  ownerEmail: string;
  login: (email: string, passcode: string, secretAnswer: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === '1') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, passcode: string, secretAnswer: string) => {
    const ok =
      email.trim().toLowerCase() === OWNER_EMAIL &&
      passcode === OWNER_PASSCODE &&
      secretAnswer.trim().toLowerCase() === SECRET_ANSWER;
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
    <AuthContext.Provider value={{ isAuthenticated, ownerEmail: OWNER_EMAIL, login, logout }}>
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

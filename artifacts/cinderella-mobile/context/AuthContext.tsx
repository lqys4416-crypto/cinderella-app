import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';

// ─── Module-level token for the API client getter ───────────────────────────
let _currentToken: string | null = null;
setAuthTokenGetter(() => _currentToken);

const TOKEN_KEY = 'cinderella_token';
const USER_KEY = 'cinderella_user';

// ─── Context ─────────────────────────────────────────────────────────────────
interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from AsyncStorage on startup
    (async () => {
      try {
        const [savedToken, savedUser] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        const tok = savedToken[1];
        const usr = savedUser[1];
        if (tok) {
          _currentToken = tok;
          setToken(tok);
          if (usr) {
            setUserState(JSON.parse(usr));
          }
        }
      } catch {
        // Ignore storage errors — treat as logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Keep module-level token ref in sync
  useEffect(() => {
    _currentToken = token;
  }, [token]);

  const login = useCallback(async (newToken: string, newUser: User) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, newToken],
      [USER_KEY, JSON.stringify(newUser)],
    ]);
    _currentToken = newToken;
    setToken(newToken);
    setUserState(newUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    _currentToken = null;
    setToken(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(u)).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
  role?: string;
};

export type LoginResult = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: AuthUser;
};

type AuthState = {
  status: 'loading' | 'ready';
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  login: (input: LoginInput, options?: { remember?: boolean }) => Promise<LoginResult>;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

const STORAGE_KEY = 'hrms_auth_session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as AuthState;
    if (parsed?.token && parsed?.user) {
      return {
        status: 'ready',
        token: parsed.token,
        user: parsed.user
      };
    }
  } catch {
    return null;
  }

  return null;
}

function saveSession(session: { token: string; user: AuthUser }, remember: boolean) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', token: null, user: null });

  useEffect(() => {
    const storedSession = readStoredSession();
    if (storedSession) {
      setState(storedSession);
      return;
    }

    setState({ status: 'ready', token: null, user: null });
  }, []);

  async function login(input: LoginInput, options?: { remember?: boolean }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    const payload = (await response.json().catch(() => null)) as LoginResult & { detail?: string } | null;
    if (!response.ok || !payload || !('access_token' in payload)) {
      throw new Error(payload && 'detail' in payload && payload.detail ? payload.detail : 'Unable to sign in');
    }

    const nextSession = {
      token: payload.access_token,
      user: payload.user
    };

    saveSession(nextSession, options?.remember ?? true);
    setState({ status: 'ready', token: payload.access_token, user: payload.user });
    return payload;
  }

  function logout() {
    clearSession();
    setState({ status: 'ready', token: null, user: null });
  }

  function updateUser(userPatch: Partial<AuthUser>) {
    setState((prev) => {
      const nextUser = prev.user ? { ...prev.user, ...userPatch } : (userPatch as AuthUser);
      const nextState = { ...prev, user: nextUser };
      try {
        // persist to storage if token exists
        if (nextState.token && nextUser) {
          const storage = window.localStorage.getItem(STORAGE_KEY) ? window.localStorage : window.sessionStorage;
          storage.setItem(STORAGE_KEY, JSON.stringify({ token: nextState.token, user: nextUser }));
        }
      } catch {}
      return nextState;
    });
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token && state.user),
      login,
      logout,
      updateUser
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

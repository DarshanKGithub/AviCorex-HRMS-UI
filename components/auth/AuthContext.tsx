'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/apiBase';

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  employee_id?: string | null;
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
  refreshUser: () => Promise<void>;
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
    if (storedSession?.token) {
      setState(storedSession);
      void fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedSession.token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((me) => {
          if (!me?.id) return;
          setState((prev) => ({
            ...prev,
            user: {
              id: me.id,
              full_name: me.full_name,
              email: me.email,
              role: me.role,
              employee_id: me.employee_id ?? me.id,
              avatar_url: me.avatar_url,
            },
          }));
        })
        .catch(() => undefined);
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
      user: {
        ...payload.user,
        employee_id: payload.user.employee_id ?? payload.user.id,
      },
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
          const sessionValue = JSON.stringify({ token: nextState.token, user: nextUser });
          window.localStorage.setItem(STORAGE_KEY, sessionValue);
          window.sessionStorage.setItem(STORAGE_KEY, sessionValue);
        }
      } catch {}
      return nextState;
    });
  }

  async function refreshUser() {
    if (!state.token) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });

    if (!response.ok) {
      return;
    }

    const me = await response.json().catch(() => null);
    if (!me?.id) {
      return;
    }

    const nextUser: AuthUser = {
      id: me.id,
      full_name: me.full_name,
      email: me.email,
      role: me.role,
      employee_id: me.employee_id ?? me.id,
      avatar_url: me.avatar_url,
    };

    setState((prev) => {
      const nextState = { ...prev, user: nextUser };
      try {
        if (nextState.token && nextUser) {
          const sessionValue = JSON.stringify({ token: nextState.token, user: nextUser });
          window.localStorage.setItem(STORAGE_KEY, sessionValue);
          window.sessionStorage.setItem(STORAGE_KEY, sessionValue);
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
      updateUser,
      refreshUser
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type PermissionPayload = {
  role: string;
  permissions: string[];
};

type PermissionState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  role: string | null;
  permissions: string[];
};

export function usePermissions() {
  const { status: authStatus, token, isAuthenticated, user } = useAuth();
  const [state, setState] = useState<PermissionState>({
    status: 'idle',
    role: null,
    permissions: []
  });

  useEffect(() => {
    if (authStatus !== 'ready') {
      return;
    }

    if (!isAuthenticated || !token) {
      setState({ status: 'ready', role: null, permissions: [] });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading' }));

    void fetch(`${API_BASE_URL}/auth/me/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Unable to fetch permissions');
        }
        return (await res.json()) as PermissionPayload;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setState({
          status: 'ready',
          role: payload.role ?? user?.role ?? null,
          permissions: Array.isArray(payload.permissions) ? payload.permissions : []
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setState({
          status: 'error',
          role: user?.role ?? null,
          permissions: []
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, isAuthenticated, token, user?.role]);

  const permissionSet = useMemo(() => new Set(state.permissions), [state.permissions]);

  const hasPermission = (permission: string) => permissionSet.has('*') || permissionSet.has(permission);

  const hasAnyPermission = (permissions: string[]) => {
    if (permissions.length === 0) {
      return true;
    }
    return permissions.some((permission) => hasPermission(permission));
  };

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    permissionSet
  };
}

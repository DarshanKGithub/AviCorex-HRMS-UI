'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { getPermissionsForRole } from '@/components/auth/rolePermissions';

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
        const resolvedRole = payload.role ?? user?.role ?? null;
        const resolvedPermissions = Array.isArray(payload.permissions) && payload.permissions.length > 0
          ? payload.permissions
          : getPermissionsForRole(resolvedRole);
        setState({
          status: 'ready',
          role: resolvedRole,
          permissions: resolvedPermissions
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setState({
          status: 'ready',
          role: user?.role ?? null,
          permissions: getPermissionsForRole(user?.role)
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, isAuthenticated, token, user?.role]);

  const permissionSet = useMemo(() => new Set(state.permissions), [state.permissions]);

  const permissionSetWithWildcard = useMemo(() => permissionSet, [permissionSet]);

  const hasPermission = useCallback(
    (permission: string) => permissionSetWithWildcard.has('*') || permissionSetWithWildcard.has(permission),
    [permissionSetWithWildcard]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => {
      if (permissions.length === 0) {
        return true;
      }
      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  const entitlementSet = useMemo(() => new Set(user?.entitlements ?? []), [user?.entitlements]);

  const hasEntitlement = useCallback((featureKey: string) => entitlementSet.has(featureKey), [entitlementSet]);

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasEntitlement,
    permissionSet
  };
}

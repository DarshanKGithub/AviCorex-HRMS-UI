'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/components/auth/usePermissions';

type ActionGuardProps = {
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function ActionGuard({ anyOf = [], allOf = [], fallback = null, children }: ActionGuardProps) {
  const { hasPermission } = usePermissions();

  const anyPass = anyOf.length === 0 || anyOf.some((permission) => hasPermission(permission));
  const allPass = allOf.length === 0 || allOf.every((permission) => hasPermission(permission));

  if (!anyPass || !allPass) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

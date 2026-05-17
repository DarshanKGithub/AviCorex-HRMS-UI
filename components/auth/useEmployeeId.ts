'use client';

import { useAuth } from '@/components/auth/AuthContext';

/** Employee record id for the signed-in user (attendance, leave, payroll self-service). */
export function useEmployeeId(): string {
  const { user } = useAuth();
  if (!user) return '';
  return user.employee_id ?? user.id;
}

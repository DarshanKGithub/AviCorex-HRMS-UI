import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function EmployeesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

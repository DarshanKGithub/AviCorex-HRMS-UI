import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

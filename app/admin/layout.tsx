import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

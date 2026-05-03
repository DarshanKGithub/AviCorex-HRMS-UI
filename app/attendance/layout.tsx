import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

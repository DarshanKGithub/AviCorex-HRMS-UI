import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function GrievanceLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

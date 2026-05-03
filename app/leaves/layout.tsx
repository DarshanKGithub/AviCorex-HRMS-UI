import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

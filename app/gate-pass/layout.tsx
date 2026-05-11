import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function GatePassLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

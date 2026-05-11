import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function EngageLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

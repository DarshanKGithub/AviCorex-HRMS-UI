import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function LifecycleLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

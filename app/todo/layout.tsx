import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function TodoLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

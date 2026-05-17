import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

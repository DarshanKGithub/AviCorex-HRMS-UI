import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function HelpdeskLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
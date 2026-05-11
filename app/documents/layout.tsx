import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
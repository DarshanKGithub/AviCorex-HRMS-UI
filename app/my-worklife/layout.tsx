import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function MyWorklifeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

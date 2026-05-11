import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
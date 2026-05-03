import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

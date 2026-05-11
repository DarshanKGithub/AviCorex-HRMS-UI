import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

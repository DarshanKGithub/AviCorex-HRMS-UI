import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

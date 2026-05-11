import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

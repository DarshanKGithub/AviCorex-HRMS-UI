import { Suspense } from 'react';
import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedShell>
      <Suspense fallback={null}>{children}</Suspense>
    </ProtectedShell>
  );
}

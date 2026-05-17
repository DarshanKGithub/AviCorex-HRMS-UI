import { Suspense } from 'react';
import { ProtectedShell } from '@/components/shell/ProtectedShell';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedShell>
      <Suspense fallback={null}>{children}</Suspense>
    </ProtectedShell>
  );
}

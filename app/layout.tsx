import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import SaaSShell from '@/components/shell/SaaSShell';

export const metadata: Metadata = {
  title: 'HRMS SaaS',
  description: 'HRMS platform frontend scaffold for Phase 1 authentication and SaaS UX.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <SaaSShell>
            {children}
          </SaaSShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}

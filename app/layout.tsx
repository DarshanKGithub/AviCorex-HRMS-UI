import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';

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
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}

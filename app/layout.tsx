import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'GreaterHR - Where Workforce Meets Insight',
  description: 'GreaterHR is the workforce platform frontend for authentication, operations, and SaaS UX.'
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

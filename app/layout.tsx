import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Upstairs - Where Workforce Meets Insight',
  description: 'UpsatirsHR is the workforce platform frontend for authentication, operations, and SaaS UX.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ReactQueryProvider>
          <ThemeRegistry>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

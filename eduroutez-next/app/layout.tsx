import Providers from '@/components/layout/providers';
import ClientBootstrap from '@/components/layout/client-bootstrap';
import ScheduleBadge from '@/components/layout/schedule-badge';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eduroutes App',
  description: 'Basic dashboard with Next.js and Shadcn'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lato.className}`}
      suppressHydrationWarning={true}
    >
      <body className="">
        <NextTopLoader showSpinner={false} />
        <Providers>
          <ClientBootstrap>
            <Toaster />
            {children}
          </ClientBootstrap>
        </Providers>
      </body>
    </html>
  );
}

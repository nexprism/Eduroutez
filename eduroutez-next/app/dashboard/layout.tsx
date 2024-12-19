import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eduroutes App',
  description: 'Eduroutes App'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar>{children}</AppSidebar>
    </>
  );
}

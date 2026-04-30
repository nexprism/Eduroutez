'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // Prevent flashing of protected content before auth check
  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <AppSidebar>{children}</AppSidebar>
    </>
  );
}

'use client';

import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WebinarPackageTable from './webinar-package-tables/webinar-package-table';

export default function WebinarPackageListingPage() {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Webinar Packages</h1>
          <p className='text-muted-foreground mt-2'>
            Manage webinar packages and track purchases from institutes
          </p>
        </div>
        <Link href='/dashboard/webinar-package/create'>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            Create Package
          </Button>
        </Link>
      </div>

      {/* Webinar Packages Table */}
      <WebinarPackageTable />
    </div>
  );
}

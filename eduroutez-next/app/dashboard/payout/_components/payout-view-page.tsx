'use client';

import { usePathname } from 'next/navigation';
import PayoutForm from './payout-form';
import PageContainer from '@/components/layout/page-container';
import PayoutUpdateForm from '../_components/payout-tables/payout-update-form';

export default function PayoutViewPage() {
  const pathname = usePathname();
  const isUpdate = pathname?.includes('update');

  return (
    <>
      {isUpdate ? <PayoutUpdateForm /> : <PayoutForm />}
    </>
  );
}
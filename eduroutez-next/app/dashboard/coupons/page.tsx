import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import CouponForm from './_components/coupon-form';
import CouponList from './_components/coupon-list';

export const metadata = {
  title: 'Dashboard : Coupons'
};

export default function Page() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Coupons</h1>
          {/* Button is kept for future use (e.g., toggling list vs form) */}
          <Button type="button" className="ml-auto" disabled>
            Add Coupon
          </Button>
        </div>
        <CouponForm />
        <CouponList />
      </div>
    </PageContainer>
  );
}

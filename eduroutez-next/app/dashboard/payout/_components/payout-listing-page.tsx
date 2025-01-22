'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import PayoutTable from './payout-tables';
import { useQuery } from '@tanstack/react-query';

import { usePayoutTableFilters } from './payout-tables/use-payout-table-filters';
import axiosInstance from '@/lib/axios';

type TPayoutListingPage = {};

export default function PayoutListingPage({}: TPayoutListingPage) {
  const { searchQuery, page, limit } = usePayoutTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const apiEndpoint = role === 'SUPER_ADMIN' ? `${apiUrl}/payouts` : `${apiUrl}/payouts-by-user`;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['payouts', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(apiEndpoint, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    }
  });

  const payouts = data?.data?.result || [];
  const totalDocuments = data?.data?.totalDocuments || 0;

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Payout (${totalDocuments})`}
                description="All payouts online and offline are listed here."
              />
                {role !== 'SUPER_ADMIN' && (
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/payout/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                  </Link>
                </Button>
                )}
            </div>
            <Separator />
            <PayoutTable
              data={payouts}
              totalData={totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

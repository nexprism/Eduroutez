'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import SubscriptionTable from './subscription-tables';
import { useQuery } from '@tanstack/react-query';

import { useSubscriptionTableFilters } from './subscription-tables/use-subscription-table-filters';
import axiosInstance from '@/lib/axios';

type TSubscriptionListingPage = {};

export default function SubscriptionListingPage({}: TSubscriptionListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useSubscriptionTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['subscriptions', searchQuery],//ensures the query refetches when searchQuery changes.
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/subscriptions`, {
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
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Subscription (${data.data.totalDocuments})`}
                description="All subscriptions online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                {localStorage.getItem('role') === 'SUPER_ADMIN' && (
                  <Link href="/dashboard/subscription/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                  </Link>
                )}
              </Button>
            </div>
            <Separator />
            <SubscriptionTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

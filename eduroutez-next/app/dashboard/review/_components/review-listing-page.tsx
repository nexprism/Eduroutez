'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import ReviewTable from './review-tables';
import { useQuery } from '@tanstack/react-query';

import { useReviewTableFilters } from './review-tables/use-review-table-filters';
import axiosInstance from '@/lib/axios';

type TReviewListingPage = {};

export default function ReviewListingPage({}: TReviewListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useReviewTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['reviews', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/review`, {
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
  console.log('hiii');
  console.log(data);
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Review (${data?.data?.length || 0})`}
                description="All reviews online and offline are listed here."
              />
              {/* <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/review/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button> */}
            </div>
            <Separator />
            <ReviewTable
              data={data?.data || []}
              totalData={data?.data?.totalDocuments || 0}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

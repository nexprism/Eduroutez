'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import WebinarTable from './webinar-tables';
import { useQuery } from '@tanstack/react-query';

import { useWebinarTableFilters } from './webinar-tables/use-webinar-table-filters';
import axiosInstance from '@/lib/axios';

type TWebinarListingPage = {};

export default function WebinarListingPage({}: TWebinarListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useWebinarTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['webinars', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/webinars`, {
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
  console.log(data?.data);
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Webinar (${data.data.totalDocuments})`}
                description="All webinars online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/webinar/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <WebinarTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

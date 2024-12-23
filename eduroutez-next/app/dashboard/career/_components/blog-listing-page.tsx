'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import BlogTable from './blog-tables';
import { useQuery } from '@tanstack/react-query';

import { useBlogTableFilters } from './blog-tables/use-blog-table-filters';
import axiosInstance from '@/lib/axios';

type TBlogListingPage = {};

export default function BlogListingPage({}: TBlogListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useBlogTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['career', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/careers`, {
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
            <div className="flex flex-col gap-2 lg:flex-row items-start justify-between">
              <Heading
                title={`Carrer (${data.data.totalDocuments})`}
                description="All career online and offline are listed here."
              />
              <div className="flex gap-4">
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/career/new">
                    <Plus className="mr-1 h-4 w-4" /> Add New Career
                  </Link>
                </Button>
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/career/blog-category">
                    <Plus className="mr-1 h-4 w-4" /> Add New Career Category
                  </Link>
                </Button>
              </div>
            </div>
            <Separator />
            <BlogTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

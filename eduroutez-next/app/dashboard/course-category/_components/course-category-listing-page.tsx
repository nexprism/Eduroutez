'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CourseCategoryTable from './course-category-tables';
import { useQuery } from '@tanstack/react-query';

import { useCourseCategoryTableFilters } from './course-category-tables/use-course-category-table-filters';
import axiosInstance from '@/lib/axios';

type TCourseCategoryListingPage = {};

export default function CourseCategoryListingPage({}: TCourseCategoryListingPage) {
  const { searchQuery, page, limit, setPage } = useCourseCategoryTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['course-categories', searchQuery, page],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/course-categories`, {
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
            <div className="flex flex-col justify-between md:flex-row ">
              <Heading
                title={`Course Category (${data.data.totalDocuments})`}
                description="All course categories in the syetem are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/course-category/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <CourseCategoryTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

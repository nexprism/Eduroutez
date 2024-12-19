'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CourseTable from './course-tables';
import { useQuery } from '@tanstack/react-query';

import { useCourseTableFilters } from './course-tables/use-course-table-filters';
import axiosInstance from '@/lib/axios';

type TCourseListingPage = {};

export default function CourseListingPage({}: TCourseListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useCourseTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['courses', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/courses`, {
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
            <div className="flex flex-col justify-between md:flex-row ">
              <Heading
                title={`Course (${data.data.totalDocuments})`}
                description="All courses online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/course/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <CourseTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

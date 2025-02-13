'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import StudentTable from './student-tables';
import { useQuery } from '@tanstack/react-query';

import { useStudentTableFilters } from './student-tables/use-student-table-filters';
import axiosInstance from '@/lib/axios';

type TStudentListingPage = {};

export default function StudentListingPage({}: TStudentListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useStudentTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['students', searchQuery, page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/students`, {
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
                title={`Student (${data.data.totalDocuments})`}
                description="All students online and offline are listed here."
              />
            </div>
            <Separator />
            <StudentTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

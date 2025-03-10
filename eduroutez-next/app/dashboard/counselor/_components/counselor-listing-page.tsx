'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CounselorTable from './counselor-tables';
import { useQuery } from '@tanstack/react-query';
import { useCounselorTableFilters } from './counselor-tables/use-counselor-table-filters';
import axiosInstance from '@/lib/axios';

type TCounselorListingPage = {};

export default function CounselorListingPage({}: TCounselorListingPage) {
  const { searchQuery, page, limit } = useCounselorTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const instituteId = typeof window !== 'undefined' ? localStorage.getItem('instituteId') : null;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['counselors', searchQuery, page, limit, role],
    queryFn: async () => {
      const params = {
        searchFields: JSON.stringify({}),
        sort: JSON.stringify({ createdAt: 'desc' }),
        page,
        limit
      };

      const response = await axiosInstance.get(
        role === 'SUPER_ADMIN'
          ? `${apiUrl}/counselors`
          : `${apiUrl}/counselors-by-institute/${instituteId}`,
        { params }
      );


      return role === 'SUPER_ADMIN' ? response.data?.data : response.data;

    },
    enabled: !!role && (role === 'SUPER_ADMIN' || !!instituteId)
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
              title={`Counselor (${role === 'SUPER_ADMIN' ? data?.result?.length : data?.data?.result?.length})`}
              description="All counselors online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
              <Link href="/dashboard/counselor/new">
              <Plus className="mr-1 h-4 w-4" /> Add New
              </Link>
              </Button>
            </div>
            <Separator />
            {console.log('ghj', data)}
            <CounselorTable
              data={role === 'SUPER_ADMIN' ? data?.result : data?.data?.result}
              totalData={role === 'SUPER_ADMIN' ? data?.totalDocuments : data?.data?.totalDocuments}
            />
            </div>
            
        )
      )}
    </PageContainer>
  );
}
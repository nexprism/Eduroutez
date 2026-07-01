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
import { useEffect, useState } from 'react';

type TCounselorListingPage = {};

export default function CounselorListingPage({}: TCounselorListingPage) {
  const { searchQuery, page, limit } = useCounselorTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [role, setRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedInstituteId = localStorage.getItem('instituteId');
    setRole(storedRole);
    setInstituteId(storedInstituteId);
  }, []);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['counselors', searchQuery, page, limit, role, instituteId],
    queryFn: async () => {
      const params = {
        search: searchQuery || undefined,
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

      return response.data;
    },
    enabled: !!role
  });

  const result = data?.data?.result ?? [];
  const totalDocuments = data?.data?.totalDocuments ?? 0;

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
            title={`Counselor (${totalDocuments})`}
            description="All counselors online and offline are listed here."
            />
            <Button asChild className="w-fit whitespace-nowrap px-2">
            <Link href="/dashboard/counselor/new">
            <Plus className="mr-1 h-4 w-4" /> Add New
            </Link>
            </Button>
          </div>
          <Separator />
          <CounselorTable
            data={result}
            totalData={totalDocuments}
          />
        </div>
      )}
    </PageContainer>
  );
}

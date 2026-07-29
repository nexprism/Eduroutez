'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import PromotionTable from './promotion-tables';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { usePromotionTableFilters } from './promotion-tables/use-promotion-table-filters';
import axiosInstance from '@/lib/axios';

type TPromotionListingPage = {};

export default function PromotionListingPage({}: TPromotionListingPage) {
  const { searchQuery, page, limit } = usePromotionTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem('role'));
    setInstituteId(localStorage.getItem('instituteId'));
  }, []);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['Promotions', searchQuery, page, limit, userRole, instituteId],
    queryFn: async () => {
      if (userRole === null || (userRole !== 'SUPER_ADMIN' && instituteId === null)) {
        throw new Error('User information not available');
      }

      const filters: Record<string, string> = {};
      if (userRole !== 'SUPER_ADMIN' && instituteId) {
        filters.instituteId = instituteId;
      }

      const response = await axiosInstance.get(`${apiUrl}/promotions`, {
        params: {
          searchFields: JSON.stringify({}),
          filters: JSON.stringify(filters),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    },
    enabled: userRole !== null && (userRole === 'SUPER_ADMIN' || instituteId !== null),
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
                title={`Promotion (${data.data.totalDocuments})`}
                description="All Promotions online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/promotion/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <PromotionTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

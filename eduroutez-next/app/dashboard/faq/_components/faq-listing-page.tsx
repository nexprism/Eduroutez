'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import FaqTable from './faq-tables';
import { useQuery } from '@tanstack/react-query';
import { useFaqTableFilters } from './faq-tables/use-faq-table-filters';
import axiosInstance from '@/lib/axios';

export default function FaqListingPage() {
  const { searchQuery, page, limit } = useFaqTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['faqs', searchQuery, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (searchQuery) params.append('search', searchQuery);
      const response = await axiosInstance.get(`${apiUrl}/faq?${params.toString()}`);
      return response.data.data;
    },
    retry: 1,
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
                title="FAQs"
                description="All frequently asked questions are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/faq/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New FAQ
                </Link>
              </Button>
            </div>
            <Separator />
            {data ? (
              <FaqTable
                data={Array.isArray(data) ? data : (data?.result || [])}
                totalData={Number(data?.totalDocuments || (Array.isArray(data) ? data.length : 0))}
              />
            ) : (
              <div>No FAQs found.</div>
            )}
          </div>
        )
      )}
    </PageContainer>
  );
}

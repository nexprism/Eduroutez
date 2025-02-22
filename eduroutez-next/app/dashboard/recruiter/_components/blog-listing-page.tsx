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

import type { Recruiter } from '@/types';

type RecruiterResponse = {
  success: boolean;
  message: string;
  data: {
    result: Recruiter[];
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
  };
  error: Record<string, unknown>;
};

type TRecruiterListingPage = {};

export default function RecruiterListingPage({}: TRecruiterListingPage) {
  const { searchQuery, page, limit } = useBlogTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess, error } = useQuery<RecruiterResponse>({
    queryKey: ['recruiters', searchQuery, page],
    queryFn: async () => {
      try {
        const instituteId = localStorage.getItem('instituteId');
        console.log('InstituteId from localStorage:', instituteId);
        
        if (!instituteId) {
          throw new Error('Institute ID not found in localStorage');
        }

        const response = await axiosInstance.get(`${apiUrl}/recruiters-by-institute/${instituteId}`, {
          params: { page, limit }
        });
        return response.data;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    }
  });

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {(error as Error).message}</div>
      ) : (
        isSuccess && data && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row items-start justify-between">
              <Heading
                title={`Recruiter (${data.data?.totalDocuments})`}
                description="All recruiters are listed here."
              />
              <div className="flex gap-4">
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/recruiter/new">
                    <Plus className="mr-1 h-4 w-4" /> Add New Recruiter
                  </Link>
                </Button>
              </div>
            </div>
            <Separator />
            <BlogTable
              data={data.data?.result}
              totalData={data?.data?.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

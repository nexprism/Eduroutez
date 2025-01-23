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

// Define types for the webinar data structure
type Webinar = {
  _id: string;
  title: string;
  image: string;
  description: string;
  webinarLink: string;
  date: string;
  time: string;
  duration: string;
  webinarCreatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type WebinarResponse = {
  success: boolean;
  message: string;
  data: Webinar[] | null;
  error: Record<string, unknown>;
};

type TWebinarListingPage = {};

export default function WebinarListingPage({}: TWebinarListingPage) {
  const { searchQuery, page, limit } = useWebinarTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery<WebinarResponse>({
    queryKey: ['webinars', searchQuery],
    queryFn: async () => {
      const instituteId = localStorage.getItem('instituteId');
      const response = await axiosInstance.get(`${apiUrl}/webinars-by-institute/${instituteId}`);
      return response.data;
    }
  });

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`Webinar (${data?.data?.length || 0})`}
              description="All webinars online and offline are listed here."
            />
            <Button asChild className="w-fit whitespace-nowrap px-2">
              <Link href="/dashboard/webinar/new">
                <Plus className="mr-1 h-4 w-4" /> Add New
              </Link>
            </Button>
          </div>
          <Separator />
          {isSuccess && data ? (
            <WebinarTable
              data={data.data || []}
              totalData={data.data?.length || 0}
            />
          ) : (
<div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-md shadow-md">
  <div className="text-gray-500 text-lg font-semibold mb-2">No Webinars Found</div>
  <div className="text-gray-400 text-sm mb-4">It seems there are no webinars available at the moment. Please create a webinar.</div>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
  <Link href="/dashboard/webinar/new">
    Add Webinar
  </Link>
  </button>
</div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
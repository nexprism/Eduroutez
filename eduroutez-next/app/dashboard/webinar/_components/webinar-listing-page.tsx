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
import { useEffect, useState } from 'react';

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
  status: boolean;
  instituteId: string;
  instituteName: string;
  createdBy: string;
};

type WebinarData = {
  result: Webinar[];
  totalDocuments: number;
};

type WebinarResponse = {
  success: boolean;
  message: string;
  data: WebinarData;
  error: Record<string, unknown> | null;
};

// Define the props type for the WebinarTable component based on error message
type WebinarTableProps = {
  data: Webinar[];
  totalData: number;
  // Remove currentPage and pageSize since they don't exist on the expected props
};

type TWebinarListingPage = {};

export default function WebinarListingPage({}: TWebinarListingPage) {
  const { searchQuery, page, limit } = useWebinarTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);

  useEffect(() => {
    // Move localStorage access to useEffect to avoid hydration mismatch
    setUserRole(localStorage.getItem('role'));
    setInstituteId(localStorage.getItem('instituteId'));
  }, []);

  // Function to get the appropriate API endpoint based on user role
  const getApiEndpoint = () => {
    if (userRole === 'SUPER_ADMIN') {
      return `${apiUrl}/webinars`;
    }
    return `${apiUrl}/webinars-by-institute/${instituteId}`;
  };

  const { data: responseData, isLoading, isSuccess, refetch } = useQuery<WebinarResponse>({
    queryKey: ['webinars', searchQuery, page, limit, userRole, instituteId],
    queryFn: async () => {
      // Only run the query if userRole and instituteId are available
      if (userRole === null || (userRole !== 'SUPER_ADMIN' && instituteId === null)) {
        throw new Error('User information not available');
      }
      
      const response = await axiosInstance.get<WebinarResponse>(getApiEndpoint(), {
        params: { search: searchQuery, page, limit },
      });
      return response.data;
    },
    enabled: userRole !== null && (userRole === 'SUPER_ADMIN' || instituteId !== null),
    staleTime: 5000, // Adjust the time (in milliseconds) as needed
  });

  const webinarData = responseData?.data;
  const totalDocuments = webinarData?.totalDocuments || 0;
  const webinarResults = webinarData?.result || [];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-md shadow-md">
      <div className="text-gray-500 text-lg font-semibold mb-2">
        No Webinars Found
      </div>
      <div className="text-gray-400 text-sm mb-4">
        It seems there are no webinars available at the moment. Please create a webinar.
      </div>
      <Button asChild className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
        <Link href="/dashboard/webinar/new">
          Add Webinar
        </Link>
      </Button>
    </div>
  );

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`Webinar (${totalDocuments})`}
              description="All webinars online and offline are listed here."
            />
            <div className="flex space-x-2">
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/webinar/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="w-fit whitespace-nowrap px-2"
              >
                Refresh
              </Button>
            </div>
          </div>
          <Separator />
          {isSuccess && totalDocuments > 0 ? (
            <WebinarTable
              data={webinarResults}
              totalData={totalDocuments}
              // Remove currentPage and pageSize props since they're not expected by WebinarTable
            />
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </PageContainer>
  );
}
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

type News = {
  _id: string;
  title: string;
  image: string;
  description: string;
  institute: string;
  date: string;
  viewCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type SuperAdminNewsResponse = {
  success: boolean;
  message: string;
  data: {
    result: News[];
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
  };
  error: Record<string, unknown>;
};

type InstituteNewsResponse = {
  success: boolean;
  message: string;
  data: News[];
  error: Record<string, unknown>;
};

type TNewsListingPage = {};

export default function NewsListingPage({}: TNewsListingPage) {
  const { searchQuery, page, limit } = useBlogTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const userRole = localStorage.getItem('role');
  const instituteId = localStorage.getItem('instituteId');

  const { data, isLoading, isSuccess, error } = useQuery<SuperAdminNewsResponse | InstituteNewsResponse>({
    queryKey: ['news', searchQuery, userRole, page, limit],
    queryFn: async () => {
      try {
        let endpoint = `${apiUrl}/news`;
        
        if (userRole === 'SUPER_ADMIN') {
          endpoint = `${apiUrl}/news`;
        } else {
          if (!instituteId) {
            throw new Error('Institute ID not found in localStorage');
          }
          endpoint = `${apiUrl}/news/${instituteId}`;
        }

        // Add pagination and search parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());

        const queryString = params.toString();
        if (queryString) {
          endpoint += `?${queryString}`;
        }

        const response = await axiosInstance.get(endpoint);
        return response.data;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
    enabled: !!userRole && (userRole === 'SUPER_ADMIN' || !!instituteId)
  });

  // Get the correct data array based on user role
  const getNewsData = () => {
    if (!data) return [];
    
    if (userRole === 'SUPER_ADMIN') {
      const superAdminData = data as SuperAdminNewsResponse;
      return superAdminData.data.result;
    } else {
      const instituteData = data as InstituteNewsResponse;
      return instituteData.data;
    }
  };

  // Get total count based on user role
  const getTotalCount = () => {
    if (!data) return 0;
    
    if (userRole === 'SUPER_ADMIN') {
      const superAdminData = data as SuperAdminNewsResponse;
      return superAdminData.data.totalDocuments;
    } else {
      const instituteData = data as InstituteNewsResponse;
      return instituteData.data.length;
    }
  };

  const newsData = getNewsData();
  const totalCount = getTotalCount();

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading news...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 rounded-md bg-red-50">
          Error: {(error as Error).message}
        </div>
      ) : (
        isSuccess && data && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row items-start justify-between">
              <Heading
                title={`News (${totalCount})`}
                description={
                  userRole === 'SUPER_ADMIN'
                    ? "All news across institutes are listed here."
                    : "All news for your institute are listed here."
                }
              />
              <div className="flex gap-4">
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/news/new">
                    <Plus className="mr-1 h-4 w-4" /> Add New News
                  </Link>
                </Button>
              </div>
            </div>
            <Separator />
            <BlogTable
              data={newsData}
              totalData={totalCount}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
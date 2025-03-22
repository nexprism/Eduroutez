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

import { Blog } from '@/types';

type SuperAdminBlogResponse = {
  success: boolean;
  message: string;
  data: {
    result: Blog[];
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
  };
  error: Record<string, unknown>;
};

type InstituteAdminBlogResponse = {
  success: boolean;
  message: string;
  data: Blog[];
  error: Record<string, unknown>;
};

type TBlogListingPage = {};

export default function BlogListingPage({}: TBlogListingPage) {
  const { searchQuery, page, limit } = useBlogTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const userRole = localStorage.getItem('role');
  const instituteId = localStorage.getItem('instituteId');

  const { data, isLoading, isSuccess, error } = useQuery<SuperAdminBlogResponse | InstituteAdminBlogResponse>({
    queryKey: ['blogs', searchQuery, userRole, page, limit],
    queryFn: async () => {
      try {
        let response;

        if (userRole === 'SUPER_ADMIN') {
          response = await axiosInstance.get(`${apiUrl}/blogs`, {
            params: { search: searchQuery, page, limit ,          sort: JSON.stringify({ createdAt: 'desc' }),
          }
          });
        } else {
          if (!instituteId) {
            throw new Error('Institute ID not found in localStorage');
          }
          response = await axiosInstance.get(`${apiUrl}/blogs-by-institute/${instituteId}`, {
            params: { search: searchQuery, page, limit }
          });
        }

        return response.data;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
    enabled: !!userRole && (userRole === 'SUPER_ADMIN' || !!instituteId)
  });

  // Get the correct data array based on user role
  const getBlogData = () => {
    if (!data) return [];
    
    if (userRole === 'SUPER_ADMIN') {
      const superAdminData = data as SuperAdminBlogResponse;
      return superAdminData.data.result;
    } else {
      const instituteData = data as InstituteAdminBlogResponse;
      return instituteData.data;
    }
  };

  // Get total count based on user role
  const getTotalCount = () => {
    if (!data) return 0;
    
    if (userRole === 'SUPER_ADMIN') {
      const superAdminData = data as SuperAdminBlogResponse;
      return superAdminData.data.totalDocuments;
    } else {
      const instituteData = data as InstituteAdminBlogResponse;
      return instituteData.data.length;
    }
  };

  const blogData = getBlogData();
  const totalCount = getTotalCount();

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
                title={`Blog (${totalCount})`}
                description="All blogs online and offline are listed here."
              />
              <div className="flex gap-4">
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/blog/new">
                    <Plus className="mr-1 h-4 w-4" /> Add New Blog
                  </Link>
                </Button>
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/blog/blog-category">
                    <Plus className="mr-1 h-4 w-4" /> Add New Blog Category
                  </Link>
                </Button>
              </div>
            </div>
            <Separator />
            <BlogTable
              data={blogData}
              totalData={totalCount}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
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
import { useEffect } from 'react';

interface Career {
  _id: string;
  title: string;
  image: string;
  description: string;
  category: { _id: string; name: string };
  eligibility: string;
  jobRoles: string;
  topColleges: string;
  instituteId: string;
  createdAt: string;
  updatedAt: string;
  status: string; // Added status property
}

interface CareerResponse {
  totalDocuments: number;
  success: boolean;
  message: string;
  data: Career[];
  error: Record<string, any>;
}

type TCareerListingPage = {};

export default function CareerListingPage({}: TCareerListingPage) {
  const { searchQuery, page, limit, setPage } = useBlogTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess, refetch } = useQuery<CareerResponse>({
    queryKey: ['career', searchQuery, page, limit],
    queryFn: async () => {
      const institute = localStorage.getItem('instituteId');
      if (!institute) {
        throw new Error('Institute ID not found');
      }
      const response = await axiosInstance.get(`${apiUrl}/careers`, {
        params: {
          search: searchQuery,
          page,
          limit
        }
      });
      console.log('fghjk',response.data);
      return response.data?.data;
    }
  });

  useEffect(() => {
    refetch();
  }, [page]);

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row items-start justify-between">
              <Heading
                title={`Career (${data?.result?.length})`}
                description="All careers online and offline are listed here."
              />
              <div className="flex gap-4">
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/career/new">
                    <Plus className="mr-1 h-4 w-4" /> Add New Career
                  </Link>
                </Button>
                <Button asChild className="w-fit whitespace-nowrap px-2">
                  <Link href="/dashboard/career/category">
                    <Plus className="mr-1 h-4 w-4" /> Add New Career Category
                  </Link>
                </Button>
              </div>
            </div>
            <Separator />
            <BlogTable
              data={data?.result?.map(career => ({
                ...career,
                category: { _id: career.category._id, name: career.category.name }, // Assuming IBlogCategory has '_id' and 'name' properties
                status: career.status === 'true' // Convert status to boolean
              }))}
              totalData={data?.totalDocuments}
              onPageChange={setPage} // Assuming BlogTable has an onPageChange prop
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
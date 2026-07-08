'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import ReviewTable from './review-tables';
import { useQuery } from '@tanstack/react-query';
import { useReviewTableFilters } from './review-tables/use-review-table-filters';
import axiosInstance from '@/lib/axios';

type TReviewListingPage = {};

export default function ReviewListingPage({}: TReviewListingPage) {
  const { searchQuery, page, limit } = useReviewTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Get user role and email from localStorage
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const id = localStorage.getItem('instituteId');

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['reviews', searchQuery, role, email, page, limit], // Include page and limit in the query key
    queryFn: async () => {
      if (role === 'institute') {
        const response = await axiosInstance.get(`${apiUrl}/review-by-institute/${id}`);
        if (response.data?.success && response.data?.data) {
          return {
            success: true,
            data: response.data.data,
            totalDocuments: response.data.data?.length
          };
        }
        return { success: true, data: [], totalDocuments: 0 };
      } else if (role === 'SUPER_ADMIN') {
        const response = await axiosInstance.get(`${apiUrl}/review`, {
          params: {
            searchFields: JSON.stringify({}),
            sort: JSON.stringify({ createdAt: 'desc' }),
            page: page,
            limit: limit
          }
        });
        return response.data;
      } else {
        const response = await axiosInstance.get(`${apiUrl}/reviews-by-user/${email}`);
        if (response.data?.success && Array.isArray(response.data?.data)) {
          return {
            success: true,
            data: { result: response.data.data, totalDocuments: response.data.data.length },
            totalDocuments: response.data.data.length
          };
        }
        return { success: true, data: { result: [], totalDocuments: 0 }, totalDocuments: 0 };
      }
    },
    staleTime: 5000
  });

  const getTitle = () => {
    if (role === 'institute') {
      return `Institute Reviews (${data?.data?.totalDocuments || 0})`;
    }
    if (role === 'SUPER_ADMIN') {
      return `All Reviews (${data?.data?.totalDocuments || 0})`;
    }
    return `My Reviews (${data?.totalDocuments || 0})`;
  };

  const getDescription = () => {
    if (role === 'institute') {
      return "Reviews submitted for your institute.";
    }
    if (role === 'SUPER_ADMIN') {
      return "All reviews online and offline are listed here.";
    }
    return "Reviews you have submitted.";
  };

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={getTitle()}
                description={getDescription()}
              />
            </div>
            <Separator />
            <ReviewTable
              data={data?.data || []}
              totalData={data?.data?.totalDocuments || 0}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

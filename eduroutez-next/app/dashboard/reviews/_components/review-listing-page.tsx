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

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['reviews', searchQuery, role, email, page, limit],
    queryFn: async () => {
      if (role === 'counsellor') {
        const response = await axiosInstance.get(`${apiUrl}/counselor/${email}`);
        if (response.data?.success && response.data?.data?.[0]?.reviews) {
          return {
            success: true,
            data: response.data.data[0].reviews.map((review: any) => ({
              ...review,
              counselorName: `${response.data.data[0].firstname} ${response.data.data[0].lastname}`,
              counselorEmail: response.data.data[0].email,
            })),
            totalDocuments: response.data.data[0].reviews.length
          };
        }
        return { success: true, data: [], totalDocuments: 0 };
      } else if (role === 'SUPER_ADMIN') {
        const response = await axiosInstance.get(`${apiUrl}/review`, {
          params: {
            search: searchQuery || undefined,
            sort: JSON.stringify({ createdAt: 'desc' }),
            page: page,
            limit: limit
          }
        });
        return response.data;
      } else {
        const response = await axiosInstance.get(`${apiUrl}/reviews-by-user/${email}`);
        if (response.data?.success && Array.isArray(response.data?.data)) {
          const mapped = response.data.data.map((r: any) => ({
            ...r,
            counselorName: r.instituteName || 'N/A',
          }));
          return {
            success: true,
            data: mapped,
            totalDocuments: mapped.length
          };
        }
        return { success: true, data: [], totalDocuments: 0 };
      }
    }
  });

  const getTitle = () => {
    if (role === 'counsellor') {
      return `My Reviews (${data?.data?.length || 0})`;
    }
    return `Reviews (${data?.data?.length || 0})`;
  };

  const getDescription = () => {
    if (role === 'counsellor') {
      return "All reviews received for your counseling sessions.";
    }
    return "All reviews online and offline are listed here.";
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
              totalData={data?.totalDocuments || 0}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
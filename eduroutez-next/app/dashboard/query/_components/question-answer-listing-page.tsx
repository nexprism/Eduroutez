'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import QuestionAnswerTable from './question-answer-tables';
import { useQuestionAnswerTableFilters } from './question-answer-tables/use-question-answer-table-filters';
import axiosInstance from '@/lib/axios';

type TQuestionAnswerListingPage = {};

export default function QuestionAnswerListingPage({}: TQuestionAnswerListingPage) {
  const { searchQuery, page, limit } = useQuestionAnswerTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const id = typeof window !== 'undefined' ? localStorage.getItem('instituteId') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['question-answers', searchQuery, page, limit, role],
    queryFn: async () => {
      if (!id || !role) return null;

      // Prepare base params for both roles
      const baseParams = {
        page: page,
        limit: limit,
        sort: JSON.stringify({ createdAt: 'desc' })
      };

      // Add search fields if needed
      const params = role !== 'SUPER_ADMIN' 
        ? {
            ...baseParams,
            searchFields: JSON.stringify({})
          }
        : baseParams;

      const response = await axiosInstance.get(
        role === 'SUPER_ADMIN'
          ? `${apiUrl}/queries`
          : `${apiUrl}/query-by-institute/${id}`,
        { params }
      );

      // Handle different response structures for SUPER_ADMIN and other roles
      if (role === 'SUPER_ADMIN') {
        return {
          data: response.data?.data?.result || [],
          totalData: response.data?.data?.totalDocuments || 0,
          currentPage: page,
          totalPages: Math.ceil((response.data?.data?.totalDocuments || 0) / limit)
        };
      } else {
        return {
          data: response.data?.data || [],
          totalData: response.data?.data?.length || 0,
          currentPage: page,
          totalPages: Math.ceil((response.data?.total || 0) / limit)
        };
      }
    },
    enabled: !!id && !!role
  });

  // Calculate the total count for display
  const totalCount = data?.totalData ?? 0;

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Queries (${totalCount})`}
                description="All question and answers are listed here."
              />
            </div>
            <Separator />
            <QuestionAnswerTable
              data={data?.data ?? []}
              totalData={data?.totalData ?? 0}
              currentPage={data?.currentPage ?? 1}
              totalPages={data?.totalPages ?? 1}
              isLoading={isLoading}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
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

      const params = {
        searchFields: JSON.stringify({}),
        sort: JSON.stringify({ createdAt: 'desc' }),
        page,
        limit
      };

      const response = await axiosInstance.get(
        role === 'SUPER_ADMIN' 
          ? `${apiUrl}/query`
          : `${apiUrl}/query-by-institute/${id}`, 
        { params }
      );

      return response.data;
    },
    enabled: !!id && !!role
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
                title={`Queries (${data?.data?.length ?? 0})`} 
                description="All question and answers are listed here." 
              />
            </div>
            <Separator />
            <QuestionAnswerTable 
              data={data?.data ?? []} 
              totalData={data?.data?.length ?? 0} 
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
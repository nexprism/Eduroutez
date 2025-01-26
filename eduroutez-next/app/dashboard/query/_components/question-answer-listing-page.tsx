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

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['question-answers', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/queries`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    }
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/subscription/${localStorage.getItem('plan')}`
      );
      return response.data;
    }
  });

  // Determine the number of queries allowed based on the plan
  const allowedQueries = subscription?.data?.features?.find(
    (feature: { key: string; value: string }) => feature.key === 'Lead Allocation'
  )?.value;

  const displayedQueries = allowedQueries
    ? data?.data?.result?.slice(0, Math.ceil((allowedQueries / 100) * (data?.data?.totalDocuments ?? 0)))
    : data?.data?.result ?? [];

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Queries (${displayedQueries?.length ?? 0}/${data?.data?.totalDocuments ?? 0})`}
                description="All question and answers are listed here."
              />
            </div>
            <Separator />
            <QuestionAnswerTable
              data={displayedQueries}
              totalData={data?.data?.totalDocuments ?? 0}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

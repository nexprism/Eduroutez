'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import QuestionAnswerTable from './question-answer-tables';
import { useQuery } from '@tanstack/react-query';

import { useQuestionAnswerTableFilters } from './question-answer-tables/use-question-answer-table-filters';
import axiosInstance from '@/lib/axios';

type TQuestionAnswerListingPage = {};

export default function QuestionAnswerListingPage({}: TQuestionAnswerListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page=1, limit } = useQuestionAnswerTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const id=localStorage.getItem('instituteId');
  const email = localStorage.getItem('email');
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['question-answers', searchQuery, page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/scheduled-slots/${id}`, {
        params: { search: searchQuery, page: page || 1, limit }
      });
      console.log('dfg', response.data);
      return response.data;
    }
  });

  const students = data?.data?.result ?? [];
  const totalDocuments = data?.data?.totalDocuments ?? 0;

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Booked Slots`}
                description="All question and answers are listed here."
              />
               <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/slot/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <QuestionAnswerTable
              data={students}
              totalData={totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

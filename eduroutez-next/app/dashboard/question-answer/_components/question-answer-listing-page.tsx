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
  const { searchQuery, page, limit } = useQuestionAnswerTableFilters();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['question-answers', searchQuery, page, limit],
    queryFn: async () => {
      const userRole = localStorage.getItem('role');
      const institutionId = localStorage.getItem('instituteId');
      
      let endpoint;
      if (userRole === 'SUPER_ADMIN') {
        endpoint = `${apiUrl}/faq`;
      } else {
        endpoint = `${apiUrl}/faq-by-institute/${institutionId}`;
      }

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (searchQuery) params.append('search', searchQuery);

      try {
        const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching FAQ data:', error);
        throw error;
      }
    },
    retry: 1,
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
                title="Frequently Asked Questions"
                description="All question and answers are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/question-answer/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            {data && data.length > 0 ? (
              <QuestionAnswerTable
                data={data}
                totalData={data.totalDocuments}
              />
            ) : (
              <div>No Frequently Asked Questions found.</div>
            )}
          </div>
        )
      )}
    </PageContainer>
  );
}
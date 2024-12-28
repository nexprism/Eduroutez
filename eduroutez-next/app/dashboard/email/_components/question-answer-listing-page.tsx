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
import { useState } from 'react';

type TQuestionAnswerListingPage = {};

export default function QuestionAnswerListingPage({}: TQuestionAnswerListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useQuestionAnswerTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['emails', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/create-Emails`, {
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
  console.log('hello', data?.data);
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Email Templates`}
                description="All question and answers are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/email/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New Template
                </Link>
              </Button>
            </div>
            <Separator />
            <QuestionAnswerTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import QuestionAnswerTable from './question-answer-tables';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useQuestionAnswerTableFilters } from './question-answer-tables/use-question-answer-table-filters';
import axiosInstance from '@/lib/axios';

type TQuestionAnswerListingPage = {};

export default function QuestionAnswerListingPage({}: TQuestionAnswerListingPage) {
  const { searchQuery, page, limit } = useQuestionAnswerTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [userRole, setUserRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem('role'));
    setInstituteId(localStorage.getItem('instituteId'));
  }, []);

  const isInstituteUser =
    userRole !== null && userRole !== 'SUPER_ADMIN' && instituteId !== null;

  const { data: instituteData } = useQuery({
    queryKey: ['answer-institute-detail', instituteId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institute/${instituteId}`);
      return response.data.data;
    },
    enabled: isInstituteUser,
  });

  const instituteEmailParam = instituteData
    ? [instituteData?.instituteName, instituteData?.slug]
        .filter(Boolean)
        .join(',')
    : '';

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [
      'question-answers',
      searchQuery,
      page,
      limit,
      userRole,
      instituteId,
      instituteEmailParam
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        // send both question and askedBy so backend can search by question text or asker name
        searchFields: JSON.stringify({ question: searchQuery || '', askedBy: searchQuery || '' }),
        sort: JSON.stringify({ createdAt: 'desc' }),
        page: page,
        limit: limit
      };
      if (isInstituteUser && instituteEmailParam) {
        params.instituteEmail = instituteEmailParam;
      }
      const response = await axiosInstance.get(`${apiUrl}/question-answers`, {
        params
      });
      return response.data;
    },
    enabled:
      userRole !== null && (!isInstituteUser || instituteEmailParam !== '')
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
                title={`Question And Answer (${typeof data?.data?.totalDocuments === 'number' ? data.data.totalDocuments : (data?.data?.totalDocuments ? 0 : 0)})`}
                description="All question and answers are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/answer/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <QuestionAnswerTable
              data={data?.data?.result ?? []}
              totalData={Number(data?.data?.totalDocuments ?? 0)}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

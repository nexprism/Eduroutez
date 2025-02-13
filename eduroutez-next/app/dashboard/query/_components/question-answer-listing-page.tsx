'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import QuestionAnswerTable from './question-answer-tables';
import { useQuestionAnswerTableFilters } from './question-answer-tables/use-question-answer-table-filters';
import axiosInstance from '@/lib/axios';

type TQuestionAnswerListingPage = {};

export default function QuestionAnswerListingPage({}: TQuestionAnswerListingPage) {
  const { searchQuery, page, limit, setPage } = useQuestionAnswerTableFilters();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const id = typeof window !== 'undefined' ? localStorage.getItem('instituteId') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['question-answers', searchQuery, page, limit, role],
    queryFn: async () => {
      if (!id || !role) return null;

      const baseParams = {
        page,
        limit,
        sort: JSON.stringify({ createdAt: 'desc' }),
        searchFields: JSON.stringify({
          name: searchQuery || '',
          email: searchQuery || '',
          query: searchQuery || ''
        })
      };

      const params = role !== 'SUPER_ADMIN'
        ? {
            ...baseParams,
            searchFields: JSON.stringify({})
          }
        : baseParams;

      const endpoint = role === 'SUPER_ADMIN'
        ? `${apiUrl}/queries`
        : `${apiUrl}/query-by-institute/${id}`;

      const response = await axiosInstance.get(endpoint, { params });

      if (role === 'SUPER_ADMIN') {
        const transformedData = (response.data?.data?.result || []).map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          phoneNo: item.phoneNo,
          city: item.city,
          queryRelatedTo: item.queryRelatedTo,
          query: item.query,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          instituteIds: item.instituteIds || item.instituteId || []
        }));

        return {
          data: transformedData,
          totalData: response.data?.data?.totalDocuments || 0,
          currentPage: page,
          totalPages: Math.ceil((response.data?.data?.totalDocuments || 0) / limit)
        };
      } else {
        const transformedData = (response.data?.data?.result || []).map((item: any) => {
          const queryData = item.query || item;
          return {
            id: queryData._id,
            name: queryData.name,
            email: queryData.email,
            phoneNo: queryData.phoneNo,
            city: queryData.city,
            queryRelatedTo: queryData.queryRelatedTo,
            query: queryData.query,
            status: item.status,
            createdAt: queryData.createdAt,
            updatedAt: queryData.updatedAt,
            instituteIds: queryData.instituteIds || queryData.instituteId || []
          };
        });

        return {
          data: transformedData,
          totalData: response.data?.data?.totalDocuments || 0,
          currentPage: page,
          totalPages: Math.ceil((response.data?.data?.totalPages || transformedData.length) / limit)
        };
      }
    },
    enabled: !!id && !!role
  });

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
              onPageChange={setPage}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
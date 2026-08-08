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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useQuestionAnswerTableFilters } from './question-answer-tables/use-question-answer-table-filters';
import axiosInstance from '@/lib/axios';

const CATEGORY_OPTIONS = [
  { value: 'Courses', label: 'Courses' },
  { value: 'Career', label: 'Career' },
  { value: 'Institute', label: 'Institute' },
  { value: 'Placement', label: 'Placement' },
  { value: 'Admission', label: 'Admission' }
];

export default function QuestionAnswerListingPage() {
  const { searchQuery, page, limit, setPage } = useQuestionAnswerTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [userRole, setUserRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'institute'>('student');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    setUserRole(localStorage.getItem('role'));
    setInstituteId(localStorage.getItem('instituteId'));
  }, []);

  const isInstituteUser =
    userRole !== null && userRole !== 'SUPER_ADMIN' && instituteId !== null;

  // Reset page to 1 whenever tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, setPage]);

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

  const handleLabelToggle = (label: string) => {
    setSelectedLabels((prev) => {
      const next = prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label];
      setPage(1);
      return next;
    });
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [
      'question-answers',
      searchQuery,
      page,
      limit,
      userRole,
      instituteId,
      instituteEmailParam,
      activeTab,
      selectedLabels
    ],
    queryFn: async () => {
      const baseFilters: Record<string, any> = {};

      if (isInstituteUser) {
        if (activeTab === 'student') {
          // Fetch general questions (where instituteEmail is empty or null)
          baseFilters.instituteEmail = { $in: [null, ''] };
          if (selectedLabels.length > 0) {
            baseFilters.label = [selectedLabels.join('|')];
          }
        } else {
          // Fetch institute-specific questions
          baseFilters.instituteEmail = instituteEmailParam.split(',');
        }
      }

      const params: Record<string, any> = {
        searchFields: JSON.stringify({ question: searchQuery || '', askedBy: searchQuery || '' }),
        sort: JSON.stringify({ createdAt: 'desc' }),
        page: page,
        limit: limit,
        filters: JSON.stringify(baseFilters)
      };

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
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start justify-between">
              <Heading
                title={`Question And Answer (${typeof data?.data?.totalDocuments === 'number' ? data.data.totalDocuments : 0})`}
                description="All question and answers are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/answer/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />

            {isInstituteUser && (
              <Tabs defaultValue="student" value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'institute')}>
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="student">Student Q&A</TabsTrigger>
                  <TabsTrigger value="institute">Institute Details Q&A</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {isInstituteUser && activeTab === 'student' && (
              <div className="flex flex-wrap gap-2 items-center p-3 bg-muted/40 rounded-lg border">
                <span className="text-sm font-semibold text-muted-foreground mr-1">Filter by Space:</span>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedLabels.includes(cat.value);
                  return (
                    <Button
                      key={cat.value}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLabelToggle(cat.value)}
                      className="rounded-full h-8"
                    >
                      {cat.label}
                    </Button>
                  );
                })}
                {selectedLabels.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLabels([]);
                      setPage(1);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 h-8"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            )}

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

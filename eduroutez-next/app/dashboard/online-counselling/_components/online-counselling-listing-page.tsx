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
  const { searchQuery, page, limit } = useQuestionAnswerTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const email = localStorage.getItem('email');

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['counselor-slots', email],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/counselorslots/${email}`
      );
      return response.data;
    },
    enabled: !!email // only run the query if email is available
  });
  console.log('hi1');
  console.log(data?.data);
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={'Online Counselling Slots'}
                description="All question and answers are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/online-counselling/new">
                  <Plus className="mr-1 h-4 w-4" />
                  {data?.data ? 'Update Slot' : 'Create Slot'}
                </Link>
              </Button>
            </div>
            <Separator />
            <div>
              <div className="flex flex-col">
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday'
                ].map((day) => {
                  const start = data?.data[`${day.toLowerCase()}Start`];
                  const end = data?.data[`${day.toLowerCase()}End`];
                  const slots = [];

                  if (start && end) {
                    let currentTime = new Date(`1970-01-01T${start}:00`);
                    const endTime = new Date(`1970-01-01T${end}:00`);

                    while (currentTime < endTime) {
                      const nextTime = new Date(
                        currentTime.getTime() + 30 * 60000
                      ); // add 30 minutes
                      slots.push(
                        `${currentTime
                          .toTimeString()
                          .substring(0, 5)} - ${nextTime
                          .toTimeString()
                          .substring(0, 5)}`
                      );
                      currentTime = nextTime;
                    }
                  }

                  return (
                    <div key={day}>
                      <div className="w-1/3 gap-1 rounded-md border p-2">
                        {day}
                      </div>
                      <div className='flex flex-wrap gap-2 m-2'>
                        {slots.map((slot, index) => (
                          <div className='rounded ring-1 bg-red-500 text-white p-1' key={index}>{slot}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="p-4 border rounded-md w-1/3 gap-1">
                    {day}
                  </div>
                ))} */}
              </div>
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
}

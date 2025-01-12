'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

type TCounselingListingPage = {};

export default function CounselingListingPage({}: TCounselingListingPage) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const email = localStorage.getItem('email');

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['counselor-slots', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/counselors`);
      return response.data;
    },
    enabled: !!email, // only run the query if email is available
  });

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Heading
                title={'Online Counselling Slots'}
                description="Manage and view available slots for each counselor."
              />
              <Button asChild className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                <Link href="/dashboard/online-counselling/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Update Slot
                </Link>
              </Button>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.result?.map((counselor) => (
                <div
                  key={counselor._id}
                  className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all"
                >
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-blue-600">{`${counselor.firstname} ${counselor.lastname}`}</h3>
                    <p className="text-sm text-gray-500">{`Email: ${counselor.email}`}</p>
                    <p className="text-sm text-gray-500">{`Level: ${counselor.level}`}</p>
                    <p className="text-sm text-gray-500">{`Rating: ${counselor.rating} ★`}</p>
                    <p className="text-sm text-gray-500">{`Balance: ₹${counselor.balance}`}</p>
                    <p className="text-sm text-gray-500">{`Contact No: ${counselor.contactno}`}</p>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-700">Scheduled Slots:</h4>
                    {counselor.students.length === 0 ? (
                      <p className="text-gray-500">Nothing Scheduled</p>
                    ) : (
                      <ul className="space-y-2">
                        {counselor.students.map((studentSlot:any) => (
                          <li
                            key={studentSlot._id}
                            className="flex items-center justify-between bg-gray-100 p-3 rounded-md shadow-sm hover:bg-gray-200"
                          >
                            <div>
                              <strong>{studentSlot.date}</strong> at {studentSlot.slot}
                            </div>
                            <span
                              className={`${
                                studentSlot.completed
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              } text-sm font-medium`}
                            >
                              {studentSlot.completed ? 'Completed' : 'Pending'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
}

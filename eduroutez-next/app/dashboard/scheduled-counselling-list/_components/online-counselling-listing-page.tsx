'use client';
import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, ChevronDown, ChevronUp, Star, Mail, Phone, Award, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

type TCounselingListingPage = {};

export default function CounselingListingPage({}: TCounselingListingPage) {
  const [visibleItems, setVisibleItems] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const email = localStorage.getItem('email');

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['counselor-slots', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/counselor/${email}`,{
        headers: {
          'Content-Type': 'application/json'

      }});
      return response.data;
    },
    enabled: !!email,
  });

  const counselors = data?.data?.result || [];
  const totalItems = counselors.length;

  const handleToggleView = () => {
    if (isExpanded) {
      setVisibleItems(6);
      setIsExpanded(false);
    } else {
      setVisibleItems(totalItems);
      setIsExpanded(true);
    }
  };

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        isSuccess && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Heading
                title={'Online Counselling Slots'}
                description="Manage and view available slots for each counselor."
              />
              <Button asChild className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center shadow-lg hover:shadow-xl transition-all">
                <Link href="/dashboard/online-counselling/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Update Slot
                </Link>
              </Button>
            </div>
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {counselors.slice(0, visibleItems).map((counselor:any) => (
                <div
                  key={counselor._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{`${counselor.firstname} ${counselor.lastname}`}</h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-300 fill-current" />
                      <span>{counselor.rating}</span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm truncate">{counselor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">Level {counselor.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm">₹{counselor.balance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{counselor.contactno}</span>
                      </div>
                    </div>

                    {/* Scheduled Slots Section */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-800">Scheduled Slots</h4>
                      </div>
                      {counselor.students.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No slots scheduled</p>
                      ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {counselor.students.map((studentSlot: any) => (
                            <div
                              key={studentSlot._id}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-800">{studentSlot.date}</span>
                                  <span className="text-gray-500"> at {studentSlot.slot}</span>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  studentSlot.completed
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {studentSlot.completed ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalItems > 6 && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleToggleView}
                  className="px-6 py-2 bg-white border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  {isExpanded ? (
                    <>
                      See Less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      See More
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </PageContainer>
  );
}
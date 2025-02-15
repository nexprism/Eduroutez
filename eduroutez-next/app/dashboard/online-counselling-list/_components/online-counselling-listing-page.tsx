'use client';
import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ScheduledSlotsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['scheduled-slots', page, limit, searchTerm],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/scheduled-slots?search=${searchTerm}&page=${page}&limit=${limit}`
      );
      return response.data;
    },
    enabled: !!email,
  });

  // Safely access nested data with fallbacks
  const slots = data?.data?.result ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = parseInt(data?.data?.currentPage ?? '1', 10);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Safe formatter for dates
  const formatDate = (dateString:any) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const getStatusBadgeClass = (status:any) => {
    switch (status?.toLowerCase()?.trim()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Safe accessor for nested objects
  const getStudentInfo = (student:any) => {
    if (!student) return { name: 'N/A', email: 'N/A' };
    return {
      name: student.name || 'Unnamed',
      email: student.email || 'No email'
    };
  };

  const getCounselorInfo = (counselor:any) => {
    if (!counselor) return { name: 'N/A', email: 'N/A', category: 'N/A' };
    return {
      name: `${counselor.firstname || ''} ${counselor.lastname || ''}`.trim() || 'Unnamed',
      email: counselor.email || 'No email',
      category: counselor.category || 'N/A'
    };
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading
            title="Scheduled Slots"
            description="View and manage all counseling sessions"
          />
          
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search slots..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
        
        <Separator className="my-6" />
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-600 py-8">
            Failed to load scheduled slots. Please try again later.
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Counselor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Meeting Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(slots) && slots.map((slot) => {
                    if (!slot) return null;
                    
                    const studentInfo = getStudentInfo(slot.studentId);
                    const counselorInfo = getCounselorInfo(slot.counselorId);

                    return (
                      <TableRow key={slot._id || `slot-${Math.random()}`}>
                        <TableCell>
                          {formatDate(slot.date)}
                        </TableCell>
                        <TableCell>{slot.slot || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{studentInfo.name}</div>
                            <div className="text-gray-500">{studentInfo.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{counselorInfo.name}</div>
                            <div className="text-gray-500">{counselorInfo.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {counselorInfo.category}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(slot.status)}`}
                          >
                            {(slot.status || 'pending').toLowerCase()}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {slot.paymentId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {slot.link ? (
                            <a
                              href={slot.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <span className="mr-1">Join</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400">No link available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {(!Array.isArray(slots) || slots.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No scheduled slots found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
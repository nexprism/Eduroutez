'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import axiosInstance from '@/lib/axios';
import { QuestionAnswer } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CellActionProps {
  data: QuestionAnswer;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const role = localStorage.getItem('role');
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Query for fetching details
  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    
    queryKey: ['question-answer-details', data.id],
    queryFn: async () => {
      console.log('h',data);
      const response = await axiosInstance({
        url: `${apiUrl}/query/${data.id}`,
        method: 'GET',
      });
      console.log(response.data)
      return response.data?.data;
    },
    enabled: detailsOpen, // Only fetch when modal is open
  });

  const deleteQuestionAnswerMutation = useMutation({
    mutationFn: async (questionAnswerId: string) => {
      const response = await axiosInstance({
        url: `${apiUrl}/query/${questionAnswerId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-answers'] });
      router.push('/dashboard/query');
    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
    }
  });

  const onConfirm = async () => {
    setLoading(true);
    deleteQuestionAnswerMutation.mutate(data._id);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
  <h2 className="text-lg font-semibold mb-4">Query Details</h2>
  <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
    {[
      { label: "Query Related To", value: detailsData?.queryRelatedTo },
      { label: "Query", value: detailsData?.query },
      { label: "Name", value: detailsData?.name },
      { label: "Email", value: detailsData?.email },
      { label: "Phone Number", value: detailsData?.phoneNo },
      { label: "City", value: detailsData?.city },
      { label: "Created At", value: new Date(detailsData?.createdAt).toLocaleString() },
      { label: "Status", value: detailsData?.status },
    ].map((item, index) => (
      <div key={index} className="border-b pb-2">
        <h3 className="font-medium text-gray-700">{item.label}:</h3>
        <p className="text-gray-900">{item.value || "N/A"}</p>
      </div>
    ))}

    {/* Institute IDs Section */}
    {detailsData?.instituteIds?.length > 0 && (
      <div>
        <h3 className="font-medium text-gray-700">Institute Query status Details:</h3>
        <ul className="mt-2 space-y-2">
          {detailsData.instituteIds.map((institute: any) => (
            <li key={institute._id} className="p-2 border rounded-md bg-white shadow-sm">
                            <p className="text-gray-900"><span className="font-medium">Name:</span> {institute.instituteName}</p>

              <p className="text-gray-900"><span className="font-medium">Email:</span> {institute.email}</p>
              <p className="text-gray-900">
                <span className="font-medium">Status:</span> {institute.allocatedQueries.find((query: any) => query._id === data.id)?.status || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>

          )}
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {role === 'SUPER_ADMIN' && (
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
          )}
          
          {(role === 'institute' || role === 'counselor') && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/query/update/${data?.id}/`)
              }
            >
              <Edit className="mr-2 h-4 w-4" /> Update
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
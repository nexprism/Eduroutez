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
            <div className="space-y-4">
              <div>
              <h3 className="font-medium">Query Related To:</h3>
              <p>{detailsData?.queryRelatedTo}</p>
              </div>
              <div>
              <h3 className="font-medium">Query:</h3>
              <p>{detailsData?.query}</p>
              </div>
              <div>
              <h3 className="font-medium">Name:</h3>
              <p>{detailsData?.name}</p>
              </div>
              <div>
              <h3 className="font-medium">Email:</h3>
              <p>{detailsData?.email}</p>
              </div>
              <div>
              <h3 className="font-medium">Phone Number:</h3>
              <p>{detailsData?.phoneNo}</p>
              </div>
              <div>
              <h3 className="font-medium">City:</h3>
              <p>{detailsData?.city}</p>
              </div>
              <div>
              <h3 className="font-medium">Created At:</h3>
              <p>{new Date(detailsData?.createdAt).toLocaleString()}</p>
              </div>
            
              {/* Add more fields as needed based on your API response */}
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
                router.push(`/dashboard/query/update/${data._id}/`)
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
'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import axiosInstance from '@/lib/axios';
import { Institute } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, LogIn, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Institute;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const deleteInstituteMutation = useMutation({
    mutationFn: async (instituteId: string) => {
      const response = await axiosInstance({
        url: `${apiUrl}/institute/${instituteId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
window.location.reload();    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
    }
  });


  const loginAsInstituteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance({
        url: `${apiUrl}/admin/login-as-institute/${data._id}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: (response) => {
      const tokens = response.data;
      localStorage.setItem('accessToken', JSON.stringify(tokens.accessToken));
      localStorage.setItem('refreshToken', JSON.stringify(tokens.refreshToken));
      localStorage.setItem('instituteId', tokens.user?.instituteId || tokens.user?._id);
      localStorage.setItem('role', tokens.user?.role || '');
      localStorage.setItem('subRole', tokens.user?.subRole || '');
      localStorage.setItem('email', tokens.user?.email || '');
      toast.success(`Logged in as ${tokens.user?.name || tokens.user?.email}`);
      window.location.href = '/dashboard/overview';
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to login as institute');
    }
  });

  const onConfirm = async () => {
    setLoading(true);
    deleteInstituteMutation.mutate(data._id);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => loginAsInstituteMutation.mutate()}>
            <LogIn className="mr-2 h-4 w-4" /> Login as Institute
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/institute/update/${data._id}/`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

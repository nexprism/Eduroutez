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
import { User } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const response = await axiosInstance({
        url: `${apiUrl}/admin/${adminId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      router.push('/dashboard/admin');
    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
    }
  });

  const { mutate: allowMutate } = useMutation({
    mutationFn: async (jsonData: { id: string }) => {
      const endpoint = `${apiUrl}/allow`;
      const response = await axiosInstance({
        url: endpoint,
        method: 'POST',
        data: jsonData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      const message = 'User Allowed Successfully';
      toast.success(message);
      window.location.reload();
      router.push('/dashboard/institute');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    },
  });

  const handlePermission = async () => {
    allowMutate({ id: data?._id });
  };

  const { mutate: denyMutate } = useMutation({
    mutationFn: async (jsonData: { id: string }) => {
      const endpoint = `${apiUrl}/deny`;
      const response = await axiosInstance({
        url: endpoint,
        method: 'POST',
        data: jsonData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      const message = 'User Denied Successfully';
      toast.success(message);
      window.location.reload();
      router.push('/dashboard/institute');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    },
  });

  const { mutate: holdMutate } = useMutation({
    mutationFn: async (jsonData: { id: string }) => {
      const endpoint = `${apiUrl}/hold`;
      const response = await axiosInstance({
        url: endpoint,
        method: 'POST',
        data: jsonData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      const message = 'User Put On Hold Successfully';
      toast.success(message);
      window.location.reload();
      router.push('/dashboard/institute');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    },
  });

  const handleDeny = async () => {
    denyMutate({ id: data?._id });
  };

  const handleHold = async () => {
    holdMutate({ id: data?._id });
  };

  const onConfirm = async () => {
    setLoading(true);
    deleteAdminMutation.mutate(data._id);
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
          <DropdownMenuItem onClick={handlePermission}>
            <Edit className="mr-2 h-4 w-4" /> Allow
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeny}>
            <Trash className="mr-2 h-4 w-4" /> Deny
          </DropdownMenuItem>
            <DropdownMenuItem onClick={handleHold}>
              
              <span className="mr-2 h-4 w-4">⏸️</span> On Hold
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

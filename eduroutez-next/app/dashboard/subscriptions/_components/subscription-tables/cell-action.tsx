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
import { Subscription } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CellActionProps {
  data: Subscription;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await axiosInstance({
        url: `${apiUrl}/subscription/${subscriptionId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      router.push('/dashboard/subscription');
    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
    }
  });

  const onConfirm = async () => {
    setLoading(true);
    deleteSubscriptionMutation.mutate(data._id);
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem('email');
      if (!email) {
        throw new Error('Email not found in localStorage');
      }
      const res = await axiosInstance.post(
        `${apiUrl}/instituteUpgrade/${email}`,
        { subscriptionId: data._id, planName: data?.name },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      if (res?.status === 200) localStorage.setItem('plan', data?._id);
      // localStorage.setItem('plan',res)
      router.push('/dashboard/subscription');
    } catch (error) {
      console.error('Error allowing subscription:', error);
    } finally {
      setLoading(false);
    }
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

          {localStorage.getItem('role') === 'SUPER_ADMIN' ? (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/subscription/update/${data._id}/`)
                }
              >
                <Edit className="mr-2 h-4 w-4" /> Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleAllow}>
              <Edit className="mr-2 h-4 w-4" /> Buy
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

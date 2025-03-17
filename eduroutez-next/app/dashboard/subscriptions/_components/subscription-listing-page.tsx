'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Check, X, Loader2, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const SubscriptionListingPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [planToDelete, setPlanToDelete] = useState<{ _id: string; name: string } | null>(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show notification function
  const showNotification = (message:any, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/subscriptions`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: 1,
          limit: 10
        }
      });
      return response.data;
    }
  });

  // const deleteMutation = useMutation({
  //   mutationFn: async (id: string) => {
  //     return await axiosInstance.delete(`${apiUrl}/subscription/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
  //     showNotification("Subscription plan deleted successfully");
  //     setDeleteDialogOpen(false);
  //   },
  //   onError: (error) => {
  //     showNotification((error as any).response?.data?.message || "Failed to delete subscription plan", "error");
  //   }
  // });

  // const handleDeleteClick = (plan:any) => {
  //   setPlanToDelete(plan);
  //   setDeleteDialogOpen(true);
  // };

  // const confirmDelete = () => {
  //   if (planToDelete) {
  //     deleteMutation.mutate(planToDelete._id);
  //   }
  // };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-destructive">Failed to load subscription plans</p>
        </div>
      </PageContainer>
    );
  }

  const subscriptionPlans = data?.data?.result || [];

  const formatValue = (value: string) => {
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return value;
  };

  return (
    <PageContainer scrollable>
      {/* Notification */}
      {notification.show && (
        <div className={`fixed right-4 top-4 z-50 rounded-md p-4 shadow-md ${
          notification.type === 'error' 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Subscription Plans (${data.data.totalDocuments})`}
            description="All subscription plans are listed here."
          />
          <Button asChild className="w-fit whitespace-nowrap px-2">
            <Link href="/dashboard/subscriptions/new">
              <Plus className="mr-1 h-4 w-4" /> Add New
            </Link>
          </Button>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Features</TableCell>
              <TableCell className="w-10">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptionPlans.map((plan: any) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell dangerouslySetInnerHTML={{ __html: plan.description }} />
                <TableCell>₹{parseInt(plan.price).toLocaleString()}</TableCell>
                <TableCell>{plan.duration} {plan.durationType}</TableCell>
                <TableCell>
                  <ul className="space-y-3">
                    {plan.features.slice(0, 5).map((feature: { _id: string; key: string; value: string }) => {
                      const value = formatValue(feature.value);
                      return (
                        <li key={feature._id} className="flex items-center gap-2">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )
                          ) : (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                          <span>
                            {feature.key}: {' '}
                            <span className="font-medium">
                              {typeof value === 'boolean' ? '' : feature.value}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/subscriptions/${plan._id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Update
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(plan)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {subscriptionPlans.length === 0 && (
          <div className="text-center text-muted-foreground">
            No subscription plans available at the moment.
          </div>
        )}
      </div>

      {/* <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscription plan
              {planToDelete && <strong> "{planToDelete.name}"</strong>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.status === 'pending'}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.status === 'pending' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </PageContainer>
  );
};

export default SubscriptionListingPage;
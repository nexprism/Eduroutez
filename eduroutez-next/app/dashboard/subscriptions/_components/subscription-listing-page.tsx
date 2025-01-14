'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

const SubscriptionListingPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
    </PageContainer>
  );
};

export default SubscriptionListingPage;

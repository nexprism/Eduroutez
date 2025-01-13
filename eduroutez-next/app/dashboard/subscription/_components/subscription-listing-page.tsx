'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const PricingPage = () => {
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
    <PageContainer>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="mt-2 text-muted-foreground">
            Select the perfect subscription that fits your needs
          </p>
        </div>
        
        <Separator />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subscriptionPlans.map((plan: any) => (
            <Card 
              key={plan._id} 
              className={`relative flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                plan.subscriptionType === 'POPULAR' ? 'border-primary shadow-md' : ''
              }`}
            >
              {plan.subscriptionType === 'POPULAR' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary px-3 py-1 text-sm font-medium text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription dangerouslySetInnerHTML={{ __html: plan.description }} />
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹{parseInt(plan.price).toLocaleString()}</span>
                  <span className="text-muted-foreground">
                    /{plan.duration} {plan.durationType}
                  </span>
                </div>
                
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
                
                <Button 
                  className={`mt-6 w-full ${
                    plan.subscriptionType === 'POPULAR' ? 'bg-primary' : ''
                  }`}
                  onClick={() =>  window.location.href = 'https://razorpay.com/'}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscriptionPlans.length === 0 && (
          <div className="text-center text-muted-foreground">
            No subscription plans available at the moment.
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default PricingPage;
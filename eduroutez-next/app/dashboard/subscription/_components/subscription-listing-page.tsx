'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X, Loader2, Crown, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import loadRazorpayScript from '@/lib/razorpay';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingPage = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  const { data: instituteData, isLoading: isInstituteLoading } = useQuery({
    queryKey: ['institute', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institutes/${email}`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: 1,
          limit: 10
        }
      });
      return response.data.data;
    },
    enabled: role === 'institute'
  });

  const { data: subscriptionData, isLoading: isSubscriptionLoading, isError } = useQuery({
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

  const handlePayment = async (plan:any) => {
    if (plan.price === '0') return; // Prevent payment flow for free plan
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error('Failed to load Razorpay SDK. Please try again later.');
      return;
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error('Razorpay Key ID is missing. Please check your environment variables.');
      return;
    }

    const options = {
      key: key,
      currency: 'INR',
      name: 'Eduroutez',
      description: plan.name,
      amount: parseInt(plan.price) * 100,
      handler: async (response:any) => {
        if (response.error) {
          toast.error(`Payment failed: ${response.error.description}`);
        } else {
          toast.success('Payment successful 🎉');
          try {
            await axiosInstance.post(`${apiUrl}/purchase-plan`, {
              plan: plan._id,
              paymentId: response.razorpay_payment_id,
            });
          } catch (error) {
            toast.error('Failed to record purchase');
          }
        }
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new (window).Razorpay(options);
    rzp.open();
  };

  const isLoading = isSubscriptionLoading || isInstituteLoading;

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

  const subscriptionPlans = subscriptionData?.data?.result || [];
  const activePlan = instituteData?.plan;
  const expiryDate = instituteData?.expiryDate ? new Date(instituteData.expiryDate) : null;
  const isExpired = expiryDate ? new Date() > expiryDate : false;

  const formatValue = (value:any) => {
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return value;
  };

  return (
    <PageContainer>
      <div className="space-y-8 pb-16">
        {role === 'institute' && activePlan && (
          <Alert className="bg-gradient-to-r from-primary/20 to-primary/5 border-none">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <AlertTitle className="text-lg font-semibold">
                Your Current Plan: {activePlan.name}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  ₹{parseInt(activePlan.price).toLocaleString()}
                </Badge>
                {expiryDate && (
                  <Badge variant="outline" className={`text-sm ${isExpired ? 'text-destructive' : ''}`}>
                    Expires: {expiryDate.toLocaleDateString()}
                    {isExpired && " (Expired)"}
                  </Badge>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        <Separator className="my-8" />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subscriptionPlans.map((plan:any) => {
            const isPremium = plan.subscriptionType === 'POPULAR';
            const isFree = parseInt(plan.price) === 0;
            
            return (
              <Card 
                key={plan._id} 
                className={`relative flex flex-col transition-all duration-300 ${
                  isPremium 
                    ? 'border-primary shadow-lg hover:shadow-xl hover:-translate-y-1 bg-gradient-to-b from-primary/5 to-transparent' 
                    : 'hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground rounded-full flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className={isPremium ? 'pb-2' : ''}>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {plan.name}
                    {isFree && <Badge variant="secondary">Free</Badge>}
                  </CardTitle>
                  <CardDescription 
                    className="mt-2"
                    dangerouslySetInnerHTML={{ __html: plan.description }}
                  />
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{parseInt(plan.price).toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        /{plan.duration} {plan.durationType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <ul className="space-y-4">
                      {plan.features.map((feature:any) => {
                        const value = formatValue(feature.value);
                        return (
                          <li key={feature._id} className="flex items-start gap-3">
                            {typeof value === 'boolean' ? (
                              value ? (
                                <Check className="h-5 w-5 text-primary mt-0.5" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground mt-0.5" />
                              )
                            ) : (
                              <Check className="h-5 w-5 text-primary mt-0.5" />
                            )}
                            <span className="text-sm leading-tight">
                              <span className="font-medium">{feature.key}</span>
                              {typeof value !== 'boolean' && (
                                <>: <span className="text-muted-foreground">{feature.value}</span></>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  {!isFree && (
                    <Button
                      className={`mt-6 w-full ${
                        isPremium ? 'bg-primary hover:bg-primary/90' : ''
                      }`}
                      onClick={() => handlePayment(plan)}
                    >
                      {activePlan?.name === plan.name ? 
                        (isExpired ? 'Renew Now' : 'Extend Plan') : 
                        `Get ${plan.name}`
                      }
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
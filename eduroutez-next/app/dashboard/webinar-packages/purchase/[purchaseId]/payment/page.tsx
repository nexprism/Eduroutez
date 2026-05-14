'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface PaymentPageProps {
  params: {
    purchaseId: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { purchaseId } = params;

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/webinar-purchase/${purchaseId}`);
        if (response.data.success) {
          setPurchase(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching purchase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [purchaseId]);

  const handlePayment = async () => {
    if (!purchase) return;

    try {
      setProcessing(true);

      // Create Razorpay order
      const orderResponse = await axiosInstance.post('/razorpay/create-order', {
        amount: purchase.amountPaid,
        currency: 'INR',
        receipt: `purchase_${purchaseId}`,
        description: `Webinar Package: ${purchase.packageId.name}`
      });

      const orderId = orderResponse.data.data.id;

      // Razorpay payment options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: purchase.amountPaid * 100, // Convert to paise
        currency: 'INR',
        name: 'Eduroutez',
        description: `Purchase: ${purchase.packageId.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment and confirm on backend
            const confirmResponse = await axiosInstance.post(
              `/webinar-purchase/${purchaseId}/confirm-payment`,
              {
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              }
            );

            if (confirmResponse.data.success) {
              // Redirect to success page
              router.push(`/dashboard/webinar-packages/my-purchases?success=true`);
            }
          } catch (error) {
            console.error('Payment confirmation error:', error);
            alert('Payment confirmation failed. Please contact support.');
          }
        },
        prefill: {
          email: purchase.instituteId?.email,
          contact: purchase.instituteId?.phone
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!purchase) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-muted-foreground'>Purchase not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Complete Payment</h1>
        <p className='text-muted-foreground mt-2'>
          Review and complete your purchase for {purchase.packageId.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Package Details */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Package</span>
              <span className='font-semibold'>{purchase.packageId.name}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Webinars Included</span>
              <span className='font-semibold'>{purchase.webinarLimit}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Valid Until</span>
              <span className='font-semibold'>
                {new Date(purchase.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className='border-t pt-4'>
            <div className='flex justify-between items-center text-lg'>
              <span className='font-semibold'>Total Amount</span>
              <span className='text-2xl font-bold text-green-600'>
                ₹{purchase.amountPaid.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='flex-1'>
                <p className='font-semibold text-blue-900'>Payment Status</p>
                <p className='text-sm text-blue-800 mt-1'>
                  Status: <Badge variant='outline'>{purchase.paymentStatus}</Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <p className='text-sm font-semibold mb-2'>How it works:</p>
            <ol className='text-sm space-y-2 text-gray-700'>
              <li>1. Click "Pay Now" to proceed with payment</li>
              <li>2. Complete payment on Razorpay (secure)</li>
              <li>3. You'll be redirected to your purchases</li>
              <li>4. Start using webinars immediately</li>
            </ol>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className='w-full py-6 text-lg gap-2'
            size='lg'
          >
            {processing ? (
              <>
                <Loader className='h-5 w-5 animate-spin' />
                Processing...
              </>
            ) : (
              'Pay Now with Razorpay'
            )}
          </Button>

          <Button
            variant='outline'
            onClick={() => router.back()}
            className='w-full'
            disabled={processing}
          >
            Back
          </Button>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-sm'>
        <p className='text-green-800'>
          ✓ Secure payment powered by Razorpay. Your payment information is encrypted and protected.
        </p>
      </div>
    </div>
  );
}

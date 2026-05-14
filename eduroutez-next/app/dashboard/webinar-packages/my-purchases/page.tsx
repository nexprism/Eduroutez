'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface PurchasedPackage {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    webinarCount: number;
  };
  webinarLimit: number;
  usedWebinars: number;
  remainingWebinars: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  purchasedAt: string;
  expiryDate: string;
  isExpired: boolean;
  usagePercentage: number;
}

export default function MyWebinarPurchases() {
  const [purchases, setpurchases] = useState<PurchasedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/my-webinar-purchases', {
          params: {
            onlyActive: activeTab === 'active'
          }
        });
        if (response.data.success) {
          setpurchases(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>My Webinar Packages</h1>
        <p className='text-muted-foreground mt-2'>
          Track your purchased webinar packages and usage
        </p>
      </div>

      {/* Tabs */}
      <div className='flex gap-4'>
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveTab('active')}
        >
          Active Packages
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All Packages
        </Button>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <AlertCircle className='h-8 w-8 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground mb-4'>
                {activeTab === 'active' ? 'No active packages' : 'No purchased packages'}
              </p>
              <Link href='/dashboard/webinar-packages'>
                <Button>Browse Packages</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {purchases.map((purchase) => (
            <Card key={purchase._id} className='flex flex-col'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle>{purchase.packageId.name}</CardTitle>
                    <CardDescription>
                      Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className='flex gap-2'>
                    <Badge
                      className={`${getStatusColor(purchase.paymentStatus)}`}
                      variant='outline'
                    >
                      {purchase.paymentStatus}
                    </Badge>
                    {purchase.isExpired && (
                      <Badge variant='destructive'>Expired</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                {/* Usage Stats */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Webinar Usage</span>
                    <span className='font-semibold'>
                      {purchase.usedWebinars} / {purchase.webinarLimit}
                    </span>
                  </div>
                  <Progress
                    value={purchase.usagePercentage}
                    className='h-2'
                  />
                  <p className='text-xs text-muted-foreground'>
                    {purchase.remainingWebinars} webinars remaining
                  </p>
                </div>

                {/* Amount & Expiry */}
                <div className='grid grid-cols-2 gap-4 pt-2 border-t'>
                  <div>
                    <p className='text-xs text-muted-foreground'>Amount Paid</p>
                    <p className='font-semibold'>₹{purchase.amountPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>Valid Until</p>
                    <p className='font-semibold'>
                      {new Date(purchase.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Transaction ID */}
                {purchase.transactionId && (
                  <div className='text-xs'>
                    <p className='text-muted-foreground'>Transaction ID</p>
                    <p className='font-mono'>{purchase.transactionId}</p>
                  </div>
                )}

                {/* Status-based message */}
                {purchase.paymentStatus === 'pending' && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded p-3 text-sm'>
                    <p className='text-yellow-800 font-semibold'>Payment Pending</p>
                    <p className='text-yellow-700 text-xs'>Please complete the payment to activate this package</p>
                  </div>
                )}

                {purchase.isExpired && (
                  <div className='bg-red-50 border border-red-200 rounded p-3 text-sm'>
                    <p className='text-red-800 font-semibold'>Package Expired</p>
                    <p className='text-red-700 text-xs'>This package is no longer valid</p>
                  </div>
                )}

                {purchase.paymentStatus === 'completed' && !purchase.isExpired && (
                  <div className='bg-green-50 border border-green-200 rounded p-3 text-sm flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <div>
                      <p className='text-green-800 font-semibold'>Active Package</p>
                      <p className='text-green-700 text-xs'>You can use webinars from this package</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

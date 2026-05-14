'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

interface StatsData {
  totalRevenue: number;
  totalPurchases: number;
  totalRefunded: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  averageAmount: number;
  totalWebinarsUsed: number;
  totalWebinarsAvailable: number;
  paymentStatusBreakdown: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
  };
  topPackages: Array<{
    packageId: string;
    packageName: string;
    purchaseCount: number;
    totalRevenue: number;
  }>;
  activeInstituteCount: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/webinar-purchases/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-muted-foreground'>Failed to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage =
    stats.totalWebinarsAvailable > 0
      ? Math.round((stats.totalWebinarsUsed / stats.totalWebinarsAvailable) * 100)
      : 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Webinar Package Analytics</h1>
        <p className='text-muted-foreground mt-2'>Overview of sales, usage, and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>₹{stats.totalRevenue.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              From {stats.completedPayments} completed purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Purchases</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalPurchases}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Across {stats.activeInstituteCount} institutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Amount</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>₹{stats.averageAmount.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground mt-1'>Per purchase order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Institutes</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeInstituteCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>With active purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium'>Completed</span>
                <Badge variant='default' className='bg-green-600'>
                  {stats.paymentStatusBreakdown.completed}
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-600 h-2 rounded-full'
                  style={{
                    width: `${
                      (stats.paymentStatusBreakdown.completed / stats.totalPurchases) * 100
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium'>Pending</span>
                <Badge variant='secondary' className='bg-yellow-600 text-white'>
                  {stats.paymentStatusBreakdown.pending}
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-yellow-600 h-2 rounded-full'
                  style={{
                    width: `${
                      (stats.paymentStatusBreakdown.pending / stats.totalPurchases) * 100
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium'>Failed</span>
                <Badge variant='destructive' className='bg-red-600'>
                  {stats.paymentStatusBreakdown.failed}
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-red-600 h-2 rounded-full'
                  style={{
                    width: `${(stats.paymentStatusBreakdown.failed / stats.totalPurchases) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium'>Refunded</span>
                <Badge variant='secondary' className='bg-gray-600 text-white'>
                  {stats.paymentStatusBreakdown.refunded}
                </Badge>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-gray-600 h-2 rounded-full'
                  style={{
                    width: `${
                      (stats.paymentStatusBreakdown.refunded / stats.totalPurchases) * 100
                    }%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webinar Usage */}
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Webinar Usage</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center py-6'>
              <div className='text-4xl font-bold text-blue-600'>{usagePercentage}%</div>
              <p className='text-sm text-muted-foreground mt-2'>Overall utilization</p>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Used Webinars</span>
                <span className='font-semibold'>{stats.totalWebinarsUsed}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full'
                  style={{
                    width: `${(stats.totalWebinarsUsed / stats.totalWebinarsAvailable) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Available Webinars</span>
                <span className='font-semibold'>{stats.totalWebinarsAvailable}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-gray-300 h-2 rounded-full'
                  style={{
                    width: `${((stats.totalWebinarsAvailable - stats.totalWebinarsUsed) / stats.totalWebinarsAvailable) * 100}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='border-b pb-3'>
              <p className='text-sm text-muted-foreground'>Completed Payments</p>
              <p className='text-2xl font-bold text-green-600'>₹{stats.totalRevenue.toLocaleString()}</p>
            </div>

            <div className='border-b pb-3'>
              <p className='text-sm text-muted-foreground'>Pending Amount</p>
              <p className='text-xl font-bold text-yellow-600'>
                ₹{(stats.pendingPayments * stats.averageAmount).toLocaleString()}
              </p>
              <p className='text-xs text-muted-foreground'>{stats.pendingPayments} payments</p>
            </div>

            <div>
              <p className='text-sm text-muted-foreground'>Refunded Amount</p>
              <p className='text-xl font-bold text-red-600'>
                ₹{(stats.totalRefunded).toLocaleString()}
              </p>
              <p className='text-xs text-muted-foreground'>{stats.paymentStatusBreakdown.refunded} refunds</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Packages */}
      {stats.topPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Packages</CardTitle>
            <CardDescription>Most purchased packages by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats.topPackages.map((pkg, idx) => (
                <div key={pkg.packageId} className='flex items-center justify-between pb-4 border-b last:border-0'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold'>
                      {idx + 1}
                    </div>
                    <div>
                      <p className='font-medium'>{pkg.packageName}</p>
                      <p className='text-sm text-muted-foreground'>
                        {pkg.purchaseCount} purchases
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>₹{pkg.totalRevenue.toLocaleString()}</p>
                    <p className='text-sm text-muted-foreground'>
                      ₹{(pkg.totalRevenue / pkg.purchaseCount).toLocaleString()} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

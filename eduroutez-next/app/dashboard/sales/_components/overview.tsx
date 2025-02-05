"use client";
import React, { useState, useEffect } from 'react';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, Users, CreditCard, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axiosInstance from '@/lib/axios';

const formatCurrency = (amount:any) => 
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function SalesOverviewPage() {
  interface EarningReports {
    totalSubscription: { total: number }[];
    promotionIncome: { total: number }[];
    unlistedpromotionIncome: { total: number }[];
    counselorIcome: { total: number };
    counselorShares: { total: number };
    redeemInfo: { count: number; totalPoints: number };
  }

  const [data, setData] = useState<EarningReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/earning-reports`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        const result = response?.data?.data;
        console.log('sd', result);

        if (!response.data.success) throw new Error(response.data.message);
        setData(result);
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!data) return <Alert><AlertDescription>No data available</AlertDescription></Alert>;

  const totalEarnings = (
    (data.totalSubscription[0]?.total || 0) +
    (data.promotionIncome[0]?.total || 0) +
    (data.unlistedpromotionIncome[0]?.total || 0) +
    (data.counselorIcome?.total || 0) +
    (data.counselorShares?.total || 0)
  );

  const barData = [
    { name: 'Subscriptions', amount: data.totalSubscription[0]?.total || 0 },
    { name: 'Listed Ads', amount: data.promotionIncome[0]?.total || 0 },
    { name: 'Unlisted Ads', amount: data.unlistedpromotionIncome[0]?.total || 0 },
    { name: 'Counselor', amount: data.counselorIcome?.total || 0 },
    { name: 'Counselor Shares', amount: data.counselorShares?.total || 0 }
  ];

  const pieData = [
    { name: 'Subscriptions', value: data.totalSubscription[0]?.total || 0 },
    { name: 'Ads Revenue', value: (data.promotionIncome[0]?.total || 0) + (data.unlistedpromotionIncome[0]?.total || 0) },
    { name: 'Counselor', value: data.counselorIcome?.total || 0 },
    { name: 'Counselor Shares', value: data.counselorShares?.total || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales Overview</h2>
        <div className="hidden items-center space-x-2 md:flex">
          <CalendarDateRangePicker />
          <Button>Download Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">Monthly earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.totalSubscription[0]?.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">From subscriptions</p>
              </CardContent>
            </Card>

  
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency((data.promotionIncome[0]?.total || 0) + 
                    (data.unlistedpromotionIncome[0]?.total || 0))}
                </div>
                <p className="text-xs text-muted-foreground">From all ads</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-4 md:col-span-3">
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Revenue share by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
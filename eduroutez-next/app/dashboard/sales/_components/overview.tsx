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
import ScheduledTestTimer from '@/components/layout/scheduled-test-timer';
import Banner from '@/components/layout/counsellor-verification-banner';
import ScheduleTestModal from '@/components/layout/schedule-test-modal';
import loadRazorpayScript from '@/lib/razorpay';

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
  const [counselorData, setCounselorData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>(
    (typeof window !== 'undefined' ? localStorage.getItem('verificationStatus') : null) || ''
  );
  const [verifiedBadge, setVerifiedBadge] = useState<boolean>(
    (typeof window !== 'undefined' ? localStorage.getItem('verifiedBadge') === 'true' : false)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    // Pre-populate from localStorage
    if (userRole === 'counsellor') {
      const storedDate = localStorage.getItem('scheduledTestDate');
      const storedSlot = localStorage.getItem('scheduledTestSlot');
      const storedStatus = localStorage.getItem('verificationStatus');
      const storedBadge = localStorage.getItem('verifiedBadge') === 'true';
      
      if (storedDate || storedStatus || storedBadge) {
        setVerificationStatus(storedStatus || '');
        setVerifiedBadge(storedBadge);
        setCounselorData({
          scheduledTestDate: storedDate,
          scheduledTestSlot: storedSlot,
          verificationStatus: storedStatus,
          verifiedBadge: storedBadge
        });
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [earningRes, dashboardRes] = await Promise.all([
          axiosInstance.get(`${apiUrl}/earning-reports`),
          userRole === 'counsellor' ? axiosInstance.get(`${apiUrl}/counselor-dashboard`) : Promise.resolve({ data: { data: null } })
        ]);

        if (earningRes.data.success) {
          setData(earningRes.data.data);
        }

        if (userRole === 'counsellor') {
          const cDashboardData = dashboardRes.data?.data;
          
          // Secondary fetch for full profile
          const counselorId = localStorage.getItem('instituteId');
          let profileData = null;
          if (counselorId) {
            try {
              const profileRes = await axiosInstance.get(`${apiUrl}/counselor-by-id/${counselorId}`);
              profileData = profileRes.data?.data;
            } catch (err) {
              console.error('Secondary profile fetch failed', err);
            }
          }

          const mergedCData = {
            ...(cDashboardData || {}),
            ...(profileData || {}),
            verificationStatus: profileData?.verificationStatus || cDashboardData?.verificationStatus || localStorage.getItem('verificationStatus') || '',
            scheduledTestDate: profileData?.scheduledTestDate || cDashboardData?.scheduledTestDate || localStorage.getItem('scheduledTestDate') || undefined,
            scheduledTestSlot: profileData?.scheduledTestSlot || cDashboardData?.scheduledTestSlot || localStorage.getItem('scheduledTestSlot') || undefined,
            verifiedBadge: profileData?.verifiedBadge ?? cDashboardData?.verifiedBadge ?? (localStorage.getItem('verifiedBadge') === 'true')
          };

          setCounselorData(mergedCData);
          setVerificationStatus(mergedCData.verificationStatus);
          setVerifiedBadge(mergedCData.verifiedBadge);
          
          if (mergedCData.verificationStatus) localStorage.setItem('verificationStatus', mergedCData.verificationStatus);
          if (mergedCData.scheduledTestDate) localStorage.setItem('scheduledTestDate', mergedCData.scheduledTestDate);
          if (mergedCData.scheduledTestSlot) localStorage.setItem('scheduledTestSlot', mergedCData.scheduledTestSlot);
          localStorage.setItem('verifiedBadge', String(mergedCData.verifiedBadge));
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const payAnd = async (afterPay: 'test' | 'schedule') => {
    setIsProcessing(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load.');
      setIsProcessing(false);
      return;
    }
    try {
      const options = {
        key: 'rzp_test_SPTvNCnEWS87X0',
        amount: 9900,
        currency: 'INR',
        name: 'Guidance Y',
        description: 'Counsellor Verification Payment',
        handler: async function (response: any) {
          try {
            await axiosInstance.post(`${apiUrl}/counselor-test/record-payment`, {
              amount: 99,
              transactionId: response.razorpay_payment_id || 'demo_payment_id',
              status: 'success',
            });
            if (afterPay === 'test') {
              const canGiveRes = await axiosInstance.get(`${apiUrl}/counselor-test/can-give`);
              if (canGiveRes.data?.data?.eligible) {
                setVerificationStatus('test_pending');
                localStorage.setItem('verificationStatus', 'test_pending');
              }
            } else if (afterPay === 'schedule') {
              setShowScheduleModal(true);
            }
          } catch (err) {
            console.error('Payment processing failed:', err);
          }
        },
        prefill: { email: localStorage.getItem('email') || '' },
        theme: { color: '#6366f1' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initiation failed.');
    }
    setIsProcessing(false);
  };

  const handleScheduleSubmit = async (date: string, slot: string) => {
    setIsProcessing(true);
    try {
      await axiosInstance.post('/counselor/schedule-test', { date, slot });
      setVerificationStatus('test_scheduled');
      localStorage.setItem('verificationStatus', 'test_scheduled');
      localStorage.setItem('scheduledTestDate', date);
      localStorage.setItem('scheduledTestSlot', slot);
      setShowScheduleModal(false);
    } catch (err) {
      alert('Failed to schedule test.');
    }
    setIsProcessing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!data) return <Alert><AlertDescription>No data available</AlertDescription></Alert>;

  const StatCard = ({ title, value, icon: Icon, description, color }: any) => (
    <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-tight group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-500/10')} transition-colors group-hover:scale-110 duration-300`}>
          <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          {description}
        </p>
      </CardContent>
    </Card>
  );

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
    <div className="flex-1 space-y-4 p-4 md:p-8 h-full overflow-y-scroll">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales Overview</h2>
        <div className="hidden items-center space-x-2 md:flex">
          <CalendarDateRangePicker />
          <Button>Download Report</Button>
        </div>
      </div>

      {role === 'counsellor' && (
        <>
          <Banner 
            status={verificationStatus} 
            onPay={() => payAnd('test')} 
            onSchedule={() => payAnd('schedule')} 
            scheduledTestDate={counselorData?.scheduledTestDate}
            scheduledTestSlot={counselorData?.scheduledTestSlot}
            verifiedBadge={verifiedBadge}
          />
          <ScheduleTestModal 
            open={showScheduleModal} 
            onClose={() => setShowScheduleModal(false)} 
            onSchedule={handleScheduleSubmit} 
          />
        </>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Total Revenue"
              value={formatCurrency(totalEarnings)}
              icon={DollarSign}
              description="Monthly earnings"
              color="bg-emerald-500"
            />
            <StatCard 
              title="Subscriptions"
              value={formatCurrency(data.totalSubscription[0]?.total || 0)}
              icon={Users}
              description="From subscriptions"
              color="bg-blue-500"
            />
            <StatCard 
              title="Ad Revenue"
              value={formatCurrency((data.promotionIncome[0]?.total || 0) + 
                (data.unlistedpromotionIncome[0]?.total || 0))}
              icon={TrendingUp}
              description="From all ads"
              color="bg-orange-500"
            />
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
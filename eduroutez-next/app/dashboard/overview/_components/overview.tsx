'use client'
import React, { useEffect, useState } from 'react';

import ScheduledTestTimer from '@/components/layout/scheduled-test-timer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Building2, Activity, DollarSign, BookOpen, GraduationCap, TrendingUp, CircleDollarSign } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';

import Banner from '@/components/layout/counsellor-verification-banner';
import ScheduleTestModal from '@/components/layout/schedule-test-modal';
import loadRazorpayScript from '@/lib/razorpay';
const Dashboard = () => {
  const [role, setRole] = useState('');

  interface AdminData {
    totalEarning: number;
    totalInstitutes: number;
    totalCounsellor: number;
    totalStudents: number;
    activeSubscriptionCount: number;
    newLeads: number;
    totalLeads: number;
    renewSubscriptionCount: number;
    saparteEarning: {
      subscriptionIncome: number;
      promotionIncome: number;
    };
  }

  interface InstituteData {
    newLeads: number;
    totalLeads: number;
    totalCourses: number;
    planName: string;
    expiryDate: string;
    earning: number;
    completedSlots: number;
    averageRating: number;
    pendingSlots: number;
    totalSlots: number;
    level: string;
    points: number;
    // Add other institute-specific fields as needed
    scheduledTestDate?: string;
    scheduledTestSlot?: string;
  }

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [instituteData, setInstituteData] = useState<InstituteData | null>(null);
  const [institute, setInstitute] = useState<InstituteData | null>(null);
  const [counselorData, setCounselorData] = useState<InstituteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>(
    (typeof window !== 'undefined' ? localStorage.getItem('verificationStatus') : null) || ''
  );
  const [verifiedBadge, setVerifiedBadge] = useState<boolean>(
    (typeof window !== 'undefined' ? localStorage.getItem('verifiedBadge') === 'true' : false)
  );
  const [showTest, setShowTest] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole || '');

    // Pre-populate counselorData from localStorage for faster UI response
    if (userRole === 'counsellor') {
      const storedDate = localStorage.getItem('scheduledTestDate');
      const storedSlot = localStorage.getItem('scheduledTestSlot');
      const storedStatus = localStorage.getItem('verificationStatus');

      if (storedDate || storedSlot || storedStatus) {
        setVerificationStatus(storedStatus || '');
        setVerifiedBadge(localStorage.getItem('verifiedBadge') === 'true');
        setCounselorData({
          scheduledTestDate: storedDate || undefined,
          scheduledTestSlot: storedSlot || undefined,
          verificationStatus: storedStatus || undefined,
          verifiedBadge: localStorage.getItem('verifiedBadge') === 'true'
        } as any);
      }
    }

    if (userRole === 'SUPER_ADMIN') {
      fetchAdminData();
    } else if (userRole === 'institute') {
      fetchInstituteData();
      fetchInstitute();
    }
    else if (userRole === 'counsellor') {
      fetchCounselorData();
    }
  }, []);


  const fetchCounselorData = async () => {
    try {
      // 1. Fetch from dashboard API first
      const dashboardResponse = await axiosInstance.get(`${apiUrl}/counselor-dashboard`);
      const dData = dashboardResponse.data.data;

      // 2. Fetch full profile as a secondary source (often contains more detailed verification info)
      const counselorId = localStorage.getItem('instituteId');
      let profileData = null;
      if (counselorId) {
        try {
          const profileResponse = await axiosInstance.get(`${apiUrl}/counselor-by-id/${counselorId}`);
          profileData = profileResponse.data?.data;
        } catch (err) {
          console.error('Secondary profile fetch failed', err);
        }
      }

      // 3. Merge data, prioritizing profileData for verification fields as it's usually the source of truth
      const mergedData = {
        ...(dData || {}),
        ...(profileData || {}),
        // If profileData has it, use it, otherwise keep dashboard data
        verificationStatus: profileData?.verificationStatus || dData?.verificationStatus || localStorage.getItem('verificationStatus') || '',
        scheduledTestDate: profileData?.scheduledTestDate || dData?.scheduledTestDate || localStorage.getItem('scheduledTestDate') || undefined,
        scheduledTestSlot: profileData?.scheduledTestSlot || dData?.scheduledTestSlot || localStorage.getItem('scheduledTestSlot') || undefined,
        verifiedBadge: profileData?.verifiedBadge ?? dData?.verifiedBadge ?? (localStorage.getItem('verifiedBadge') === 'true')
      };

      if (mergedData) {
        setCounselorData(mergedData);
        setVerificationStatus(mergedData.verificationStatus);
        setVerifiedBadge(mergedData.verifiedBadge);

        // Sync everything back to localStorage for persistence
        if (mergedData.verificationStatus) localStorage.setItem('verificationStatus', mergedData.verificationStatus);
        if (mergedData.scheduledTestDate) localStorage.setItem('scheduledTestDate', mergedData.scheduledTestDate);
        if (mergedData.scheduledTestSlot) localStorage.setItem('scheduledTestSlot', mergedData.scheduledTestSlot);
        localStorage.setItem('verifiedBadge', String(mergedData.verifiedBadge));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching counselor data:', error);
      setIsLoading(false);
    }
  }



  const fetchInstitute = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axiosInstance.get(`${apiUrl}/institutes/${email}`);
      console.log('Institute Data:', response.data.data);
      setInstitute(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching institute data:', error);
      setIsLoading(false);
    }
  }

  const fetchAdminData = async () => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/admin-dashboard`);
      setAdminData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setIsLoading(false);
    }
  };

  const fetchInstituteData = async () => {
    try {
      const response = await axiosInstance.get(`${apiUrl}/institute-dashboard`);
      console.log('Institute Data:', response.data.data);
      setInstituteData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching institute data:', error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, description }) => (
    <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Dynamic background glow */}
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
        {description && (
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (role === 'institute') {

    return (
      <div className="flex flex-col gap-4 p-4 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institute Dashboard Overview 👋</h1>
            <p className="text-muted-foreground">Monitor your institute's performance and metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/webinar">Go to Webinars</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Leads"
            value={instituteData?.totalLeads || 0}
            icon={GraduationCap}
            color="bg-blue-500"
            description="Enrolled students"
          />
          <StatCard
            title="New Leads"
            value={instituteData?.newLeads || 0}
            icon={Users}
            color="bg-purple-500"
            description="Active counsellors"
          />
          <StatCard
            title="Total Courses"
            value={instituteData?.totalCourses || 0}
            icon={BookOpen}
            color="bg-green-500"
            description="All counselling sessions"
          />
        </div>
      </div>
    );
  }


  // Banner action handlers

  // Payment integration for both flows

  const payAnd = async (afterPay: 'test' | 'schedule') => {
    setLoading(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }
    try {
      const options = {
        key: 'rzp_test_SPTvNCnEWS87X0',
        amount: 9900,
        currency: 'INR',
        name: 'Guidance Y',
        description: 'Counsellor Verification Demo Payment',
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
            // Fallback: show modal anyway if they paid
            if (afterPay === 'schedule') setShowScheduleModal(true);
          }
        },
        prefill: {},
        theme: { color: '#6366f1' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initiation failed.');
    }
    setLoading(false);
  };

  const handlePay = () => payAnd('test');
  const handleSchedule = () => payAnd('schedule');

  const handleScheduleSubmit = async (date: string, slot: string) => {
    setLoading(true);
    try {
      await axiosInstance.post('/counselor/schedule-test', { date, slot });
      setVerificationStatus('test_scheduled');
      localStorage.setItem('verificationStatus', 'test_scheduled');
      localStorage.setItem('scheduledTestDate', date);
      localStorage.setItem('scheduledTestSlot', slot);
      setShowTest(false);
      setShowScheduleModal(false);
    } catch (err) {
      alert('Failed to schedule test.');
    }
    setLoading(false);
  };

  if (role === 'counsellor') {
    if (isLoading) {
      return <div className="p-8 text-center text-lg">Loading...</div>;
    }
    return (
      <div className="flex flex-col gap-4 p-4 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Counselor Dashboard Overview 👋</h1>
            <p className="text-muted-foreground">Monitor your performance and metrics.</p>
          </div>
        </div>
        <Banner
          status={verificationStatus}
          onPay={handlePay}
          onSchedule={handleSchedule}
          scheduledTestDate={counselorData?.scheduledTestDate}
          scheduledTestSlot={counselorData?.scheduledTestSlot}
          verifiedBadge={verifiedBadge}
        />
        <ScheduleTestModal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleScheduleSubmit} />
        {/* Test and guidance are now on separate pages. No inline rendering here. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Level"
            value={counselorData?.level || "Career Advisor"}
            icon={BookOpen}
            color="bg-green-500"
            description="Counsellor level"
          />
          <StatCard
            title="Points"
            value={counselorData?.points || 0}
            icon={BookOpen}
            color="bg-green-500"
            description="Counsellor points"
          />
          <StatCard
            title="Earnings"
            value={counselorData?.earning || 0}
            icon={GraduationCap}
            color="bg-blue-500"
            description="Enrolled students"
          />
          <StatCard
            title="Completed Slots"
            value={counselorData?.completedSlots || 0}
            icon={Users}
            color="bg-purple-500"
            description="Active counsellors"
          />
          <StatCard
            title="Total Slots"
            value={counselorData?.totalSlots || 0}
            icon={BookOpen}
            color="bg-green-500"
            description="All counselling sessions"
          />
          <StatCard
            title="Pending Slots"
            value={counselorData?.pendingSlots || 0}
            icon={BookOpen}
            color="bg-green-500"
            description="All counselling sessions"
          />
          <StatCard
            title="Average Rating"
            value={counselorData?.averageRating || 0}
            icon={BookOpen}
            color="bg-green-500"
            description="All counselling sessions"
          />
        </div>
      </div>
    );
  }

  if (role !== 'SUPER_ADMIN') {
    return null;
  }


  const earningData = [
    { name: 'Subscription', value: adminData?.saparteEarning?.subscriptionIncome || 0 },
    { name: 'Promotion', value: adminData?.saparteEarning?.promotionIncome || 0 }
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard Overview 👋</h1>
          <p className="text-muted-foreground">Monitor your platform metrics and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/webinar">Go to Webinars</Link>
          </Button>
        </div>
      </div>


      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(adminData?.totalEarning || 0)}
              icon={DollarSign}
              color="bg-green-500"
              description="Overall platform earnings"
            />
            <StatCard
              title="Total Institutes"
              value={adminData?.totalInstitutes || 0}
              icon={Building2}
              color="bg-blue-500"
              description="Registered educational institutions"
            />
            <StatCard
              title="Total Counsellors"
              value={adminData?.totalCounsellor || 0}
              icon={Users}
              color="bg-purple-500"
              description="Active career counsellors"
            />
            <StatCard
              title="Total Students"
              value={adminData?.totalStudents || 0}
              icon={GraduationCap}
              color="bg-orange-500"
              description="Registered students"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Subscriptions"
              value={adminData?.activeSubscriptionCount || 0}
              icon={Activity}
              color="bg-emerald-500"
              description="Current active plans"
            />
            <StatCard
              title="New Leads"
              value={adminData?.newLeads || 0}
              icon={TrendingUp}
              color="bg-yellow-500"
              description="Recent prospective clients"
            />
            <StatCard
              title="Total Leads"
              value={adminData?.totalLeads || 0}
              icon={BookOpen}
              color="bg-red-500"
              description="All-time leads generated"
            />
            <StatCard
              title="Renewal Rate"
              value={`${adminData?.renewSubscriptionCount || 0}`}
              icon={CircleDollarSign}
              color="bg-indigo-500"
              description="Subscription renewals"
            />
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>Breakdown of income sources</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Subscription Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
              <CardDescription>Active vs Renewed Subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  {
                    month: 'Current',
                    active: adminData?.activeSubscriptionCount || 0,
                    renewed: adminData?.renewSubscriptionCount || 0
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#8884d8"
                    name="Active Subscriptions"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="renewed"
                    stroke="#82ca9d"
                    name="Renewed Subscriptions"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Dashboard;
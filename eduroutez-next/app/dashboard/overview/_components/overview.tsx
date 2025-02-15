'use client'
import React, { useEffect, useState } from 'react';
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
  }

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [instituteData, setInstituteData] = useState<InstituteData | null>(null);
  const [institute, setInstitute] = useState<InstituteData | null>(null);
  const [counselorData, setCounselorData] = useState<InstituteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole || '');

    if (userRole === 'SUPER_ADMIN') {
      fetchAdminData();
    } else if (userRole === 'institute') {
      fetchInstituteData();
      fetchInstitute();
    }
    else if(userRole === 'counsellor'){
      fetchCounselorData();
    }
  }, []);


const fetchCounselorData = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axiosInstance.get(`${apiUrl}/counselor-dashboard`);
      console.log('Counselor Data:', response.data.data);
      setCounselorData(response.data.data);
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

  const formatCurrency = (amount:any) => {
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
    <Card className="relative overflow-hidden">
      <div className={`absolute right-0 top-0 h-full w-2 ${color}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (role === 'institute') {
 
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institute Dashboard Overview 👋</h1>
            <p className="text-muted-foreground">Monitor your institute's performance and metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDateRangePicker />
            <Button className="bg-primary">
              <DollarSign className="mr-2 h-4 w-4" />
              Download Report
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
         <div className="p-4 bg-gray-100 rounded-lg shadow-md">
  <h2 className="text-lg font-semibold mb-2">Subscription Details</h2>
  <div className="flex flex-col gap-2">
    <p className="flex items-center gap-2">
      <BookOpen className="text-green-500" />
      <span className="font-medium">Current Plan:</span>
      <span>{institute?.planName || 'N/A'}</span>
    </p>
    <p className="flex items-center gap-2">
      <BookOpen className="text-red-500" />
      <span className="font-medium">Expiry Date:</span>
      <span>{new Date(institute?.expiryDate || '').toLocaleDateString('en-IN') || 'N/A'}</span>
      <span
        className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
          new Date(institute?.expiryDate || '') < new Date() ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}
      >
        {new Date(institute?.expiryDate || '') < new Date() ? 'Expired' : 'Active'}
      </span>
    </p>
  </div>
</div>

        </div>


      </div>
    );
  }


  if (role === 'counsellor') {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Counselor Dashboard Overview 👋</h1>
            <p className="text-muted-foreground">Monitor your performance and metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDateRangePicker />
            <Button className="bg-primary">
              <DollarSign className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

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
    <div className="flex min-h-screen flex-col gap-4 p-4 bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard Overview 👋</h1>
          <p className="text-muted-foreground">Monitor your platform metrics and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
          <Button className="bg-primary">
            <DollarSign className="mr-2 h-4 w-4" />
            Download Report
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
};

export default Dashboard;
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building2, Crown, Activity, DollarSign, Star, AlertCircle, Clock, ArrowRight, Plus, BarChart, Settings, GraduationCap, Badge, ChevronRight, BookX, Trophy, BookOpen } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Subscription {
  status: string;
}

interface CounselorData {
  level?: string;
  points?: number;
}

const Dashboard: React.FC = () => {
  const [role] = useState(localStorage.getItem('role'));
  const [newCounselors, setNewCounselors] = useState(0);
  const [newInstitutes, setNewInstitutes] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [counselorData, setCounselorData] = useState<CounselorData>({});
  const [isLoading, setIsLoading] = useState(true);
  interface Course {
    duration: any;
    durationType: any;
    courseType: any;
    courseTitle: string;
    instructor: string;
  }

  const [content, setContent] = useState<Course[]>([]);
  const [plan] = useState('free');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const email = localStorage.getItem('email');
  const page = 1;
  const limit = 10;
  const searchQuery = '';

  const { data: instituteData } = useQuery({
    queryKey: ['institute', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institutes/${email}`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      console.log('sd', response.data.data)
      return response.data.data;
    },
    enabled: role === 'institute'
  });

  useEffect(() => {
    console.log('instituteData', instituteData)
    if (instituteData?.courses) {
      setContent(instituteData.courses);
    }
  }, [instituteData]);



  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [counselorsResponse, institutesResponse, subscriptionsResponse] = await Promise.all([
          axiosInstance.get(`${apiUrl}/counselors`),
          axiosInstance.get(`${apiUrl}/institutes`),
          axiosInstance.get(`${apiUrl}/subscriptions`)
        ]);

        setNewCounselors(counselorsResponse.data.data.result.length);
        setNewInstitutes(institutesResponse.data.data.result.length);
        setSubscriptions(subscriptionsResponse.data.data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    async function fetchCounselorData() {
      if (email) {
        try {
          const response = await axiosInstance.get(`${apiUrl}/counselor/${email}`);
          setCounselorData(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (role === 'counsellor') {
      fetchCounselorData();
    }
  }, [apiUrl, role, email]);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    isLoading: boolean;
  }> = ({ title, value, icon: Icon, color, isLoading }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute right-0 top-0 h-full w-2 ${color}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const isExpired = new Date(instituteData?.expiryDate) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(instituteData?.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {role || 'User'} 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
          <Button className="bg-primary">
            <DollarSign className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {role === 'SUPER_ADMIN' && (
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value="$45,231.89"
                icon={DollarSign}
                color="bg-blue-500"
                isLoading={isLoading}
              />
              <StatCard
                title="New Counselors"
                value={newCounselors}
                icon={Users}
                color="bg-green-500"
                isLoading={isLoading}
              />
              <StatCard
                title="New Institutes"
                value={newInstitutes}
                icon={Building2}
                color="bg-orange-500"
                isLoading={isLoading}
              />
              <StatCard
                title="Active Subscriptions"
                value={activeSubscriptions.length}
                icon={Activity}
                color="bg-purple-500"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        )}

        {/* Super Admin Section */}
        {role === 'SUPER_ADMIN' && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Overview</CardTitle>
                  <CardDescription>Active vs Total Subscriptions</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', active: activeSubscriptions.length, total: subscriptions.length },
                      // Add more months as needed
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
                        dataKey="total"
                        stroke="#82ca9d"
                        name="Total Subscriptions"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Counselor Section */}
        {role === 'counsellor' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{counselorData?.level || 'Career Advisor'}</div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">75% to next level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Achievement Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{counselorData?.points || 0}</div>
                <p className="text-sm text-muted-foreground">Points earned this month</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next Milestone</span>
                    <span className="font-medium">500 points</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Institute Section */}
       {/* Institute Section */}
{role === 'institute' && (
  <div className="space-y-6">
    {/* Stats Overview */}
    <div className="grid gap-4 md:grid-cols-4">

      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader>
          <CardTitle className="text-sm text-green-700">Active Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{content.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader>
          <CardTitle className="text-sm text-purple-700">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">₹45,231</span>
          </div>
          <p className="text-xs text-purple-600 mt-2">↑ 8% from last month</p>
        </CardContent>
      </Card>


    </div>

    {/* Main Content Grid */}
    <div className="grid gap-6 md:grid-cols-12">
      {/* Top Courses Section */}
      <Card className="md:col-span-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New Courses</CardTitle>
              <CardDescription>Your top courses this month</CardDescription>
            </div>
            <Button variant="outline">
            <Link href="/dashboard//course">
              <Plus className="h-4 w-4 mr-2" />
              Add New Course
            </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.slice(0, 3).map((course, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <div className="flex items-center p-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    ['bg-blue-100', 'bg-green-100', 'bg-purple-100'][index % 3]
                  }`}>
                    <GraduationCap className={`h-6 w-6 ${
                      ['text-blue-600', 'text-green-600', 'text-purple-600'][index % 3]
                    }`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{course.courseTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Instructor: {course.instructor}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className="mb-1">
                            {course.courseType}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {course.duration} {course.durationType}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {content.length === 0 && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <BookX className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first course</p>
                <Button>
                  <Link href="/dashboard/course/new">
                  <Plus className="h-4 w-4 mr-2" />
                  </Link>
                  Create Your First Course
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <div className="md:col-span-4 space-y-6">
        {instituteData?.plan && (
          <Card className={`${
            isExpired ? 'border-red-200' : 'border-blue-200'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isExpired ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Crown className="h-5 w-5 text-blue-600" />
                )}
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="text-sm">
                    {instituteData.plan.name}
                  </Badge>
                  <span className="text-lg font-semibold">
                    ₹{parseInt(instituteData.plan.price).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                      {isExpired ? 'Expired' : `${daysUntilExpiry} days remaining`}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  variant={isExpired ? 'destructive' : 'default'}
                >
                  <Link href='/dashboard/subscription'>
                  {isExpired ? 'Renew Now' : 'Upgrade Plan'}
                  </Link>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                <Link href="/dashboard/course/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Course
                </Link>
                </Button>
              <Button variant="outline" className="w-full justify-start">
                <Link href="/dashboard/blog/new">
                <Users className="h-4 w-4 mr-2" />
                Add New Blog
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Link href="/dashboard/news/new">
                <BarChart className="h-4 w-4 mr-2" />
                
                Add News
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)}
      </Tabs>
    </div>
  );
};

export default Dashboard;


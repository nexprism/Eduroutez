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
import { TrendingUp, Users, Building2, Crown, Activity, DollarSign, Star } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const Dashboard = ({ counselorData }) => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [newCounselors, setNewCounselors] = useState(0);
  const [newInstitutes, setNewInstitutes] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [apiUrl]);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const StatCard = ({ title, value, icon: Icon, color, isLoading }) => (
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

        {/* Super Admin Section */}
        {role === 'SUPER_ADMIN' && (
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
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;

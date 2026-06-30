'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BookOpen, Building2, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#b82025', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function RecommendationPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiUrl}/courses`, {
        params: { limit: 1000 }
      });
      return res.data?.data?.result || [];
    }
  });

  const { data: institutesData } = useQuery({
    queryKey: ['admin-institutes-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiUrl}/institutes`, {
        params: { limit: 1000 }
      });
      return res.data?.data?.result || [];
    }
  });

  const { data: counselorsData } = useQuery({
    queryKey: ['admin-counselors-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiUrl}/counselors`, {
        params: { limit: 1000 }
      });
      return res.data?.data?.result || [];
    }
  });

  const courses = Array.isArray(coursesData) ? coursesData : [];
  const institutes = Array.isArray(institutesData) ? institutesData : [];
  const counselors = Array.isArray(counselorsData) ? counselorsData : [];

  const courseTypeData = courses.reduce((acc: any[], c: any) => {
    const type = c.courseType || 'Other';
    const existing = acc.find((item) => item.name === type);
    if (existing) existing.value++;
    else acc.push({ name: type, value: 1 });
    return acc;
  }, []);

  const stateData = institutes.reduce((acc: any[], inst: any) => {
    const state = inst.state || 'Unknown';
    const existing = acc.find((item) => item.name === state);
    if (existing) existing.institutes++;
    else acc.push({ name: state, institutes: 1 });
    return acc;
  }, []).sort((a: any, b: any) => b.institutes - a.institutes).slice(0, 10);

  const statsCards = [
    {
      title: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Institutes',
      value: institutes.length,
      icon: Building2,
      color: 'bg-purple-500',
      bg: 'bg-purple-50'
    },
    {
      title: 'Total Counselors',
      value: counselors.length,
      icon: Users,
      color: 'bg-green-500',
      bg: 'bg-green-50'
    },
    {
      title: 'Avg Courses/Institute',
      value: institutes.length ? (courses.length / institutes.length).toFixed(1) : '0',
      icon: TrendingUp,
      color: 'bg-orange-500',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <div className="flex flex-col justify-between md:flex-row">
          <Heading
            title="Recommendation Engine"
            description="Overview of data powering personalized student recommendations."
          />
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {courseTypeData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Institutes by State (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="institutes" fill="#b82025" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How Recommendations Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Course Matching</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Courses are scored based on cutoff eligibility (marks vs cutoff),
                  budget compatibility, and stream preference match.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Institute Filtering</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Institutes are ranked by location proximity (city/state), fee
                  affordability, course offerings, and ratings.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Counselor Proximity</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Nearby counselors are matched by location and specialization,
                  with experience level as a ranking factor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

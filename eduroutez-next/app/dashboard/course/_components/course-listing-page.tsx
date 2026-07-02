'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Lock } from 'lucide-react';
import Link from 'next/link';
import CourseTable from './course-tables';
import { useQuery } from '@tanstack/react-query';

import { useCourseTableFilters } from './course-tables/use-course-table-filters';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type TCourseListingPage = {};

export default function CourseListingPage({}: TCourseListingPage) {
  const { searchQuery, page, limit } = useCourseTableFilters();
  const [popularCourseFeature, setPopularCourseFeature] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [role, setRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    if (storedRole === 'institute') {
      setInstituteId(localStorage.getItem('instituteId'));
    }
  }, []);

  useEffect(() => {
    const fetchInstituteData = async () => {
      if (role !== 'institute' || !instituteId) return;

      try {
        const response = await axiosInstance.get(`${apiUrl}/institute/${instituteId}`);
        const instituteData = response.data.data;

        const plan = instituteData.plan;
        const feature = plan.features.find(
          (feature: any) => feature.key === 'Courses Listing'
        );
        if (feature) {
          setPopularCourseFeature(feature.value);
        }
      } catch (error) {
        console.log("Error fetching institute data:", error);
      }
    };

    fetchInstituteData();
  }, [role, instituteId]);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['courses', searchQuery, page, limit, role, instituteId],
    queryFn: async () => {
      const filters: Record<string, any> = { isPublished: '', isActive: '' };
      if (role === 'institute' && instituteId) {
        filters.instituteCategory = instituteId;
      }
      const response = await axiosInstance.get(`${apiUrl}/courses`, {
        params: {
          filters: JSON.stringify(filters),
          search: searchQuery || undefined,
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    }
  });

  const totalCourses = data?.data?.totalDocuments ?? 0;
  const coursesData = data?.data?.result ?? [];

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex flex-col justify-between md:flex-row">
              <Heading
                title={`Courses (${totalCourses})`}
                description="All courses online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/course/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            
            {role === 'institute' && popularCourseFeature !== null && totalCourses > popularCourseFeature && (
              <Alert variant="default" className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your current plan allows viewing {popularCourseFeature} courses. 
                  Upgrade your plan to view all {totalCourses} courses.
                </AlertDescription>
              </Alert>
            )}
            
            <CourseTable 
              data={role === 'institute' && popularCourseFeature !== null 
                ? coursesData.slice(0, popularCourseFeature) 
                : coursesData} 
              totalData={totalCourses} 
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

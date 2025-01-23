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
  const [content, setContent] = useState([]);
  const [popularCourseFeature, setPopularCourseFeature] = useState<number>(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const emailFromStorage = localStorage.getItem('email');
    if (role === 'institute' && emailFromStorage) {
      setEmail(emailFromStorage);
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    const fetchInstituteData = async () => {
      const id = localStorage.getItem('instituteId');
      try {
        const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
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
  }, []);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['courses', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/courses`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    },
    enabled: !enabled
  });

  useEffect(() => {
    if (isSuccess && data?.data?.result) {
      setContent(data.data.result);
    }
  }, [isSuccess, data]);

  const data1 = useQuery({
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
      return response.data;
    },
    enabled
  });

  useEffect(() => {
    if (data1?.data?.data?.courses) {
      setContent(data1.data.data.courses);
    }
  }, [data1]);

  // Calculate total courses and courses shown
  const totalCourses = content?.length || 0;
  const coursesShown = Math.min(content?.length || 0, popularCourseFeature);

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
            
            {totalCourses > popularCourseFeature && (
              <Alert variant="default" className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your current plan allows viewing {popularCourseFeature} courses. 
                  Upgrade your plan to view all {totalCourses} courses.
                </AlertDescription>
              </Alert>
            )}
            
            <CourseTable 
              data={content.slice(0, popularCourseFeature)} 
              totalData={data?.data?.totalDocuments || 0} 
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
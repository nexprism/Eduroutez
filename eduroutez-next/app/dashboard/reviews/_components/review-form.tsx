'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import Image from 'next/image';
import { Review } from '@/types';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

export default function ReviewForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const reviewId = segments[segments.length - 1];
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/review/${reviewId}`);
      return response.data;
    },
    enabled: !!reviewId
  });

  const review: Review | undefined = data?.data;

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!review) return <div className="p-8 text-center">Review not found.</div>;

  const renderStars = (count: number | undefined) => {
    const n = count || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderBooleanField = (label: string, value: boolean | undefined) => {
    if (!value) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
        {label}
      </span>
    );
  };

  const booleanFields: [string, keyof Review][] = [
    ['Guest Lecture', 'guestLectureByVisitor'],
    ['Internship', 'intership'],
    ['No Practical Exposure', 'noPracticalExposure'],
    ['Research Project', 'researchProject'],
    ['Coaching Provided', 'coachingProvided'],
    ['No Coaching', 'noCoachingProvided'],
    ['Sports Groups', 'multipleSportsGroups'],
    ['No Sports', 'noSportsGroups'],
    ['Uniform', 'isUniform'],
    ['Flexible Dress Code', 'isFlexibleDressCode'],
    ['No Dress Code', 'noDressCode'],
    ['Healthy Food', 'healthyAndQualityFood'],
    ['No Food Menu', 'noFoodMenuIsAvailable'],
    ['Unhealthy Food', 'unHealthyFood'],
    ['Nutritious Food', 'nutritiousFoodAvailable'],
    ['Daily Menu', 'dailyWiseMenuIsAvailable'],
    ['All Transport Available', 'allModesOfTransportationAvailable'],
    ['Limited Transport', 'limitedModesOfTransportationAvailable'],
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Review Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{review.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{review.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium">{review.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{review.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{review.country?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year of Graduation</p>
              <p className="font-medium">{review.yearOfGraduation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Review Title</p>
              <p className="font-medium">{review.reviewTitle || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommendation</p>
              <Badge variant={review.recommendation ? 'default' : 'secondary'}>
                {review.recommendation ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={review.status ? 'default' : 'secondary'}>
                {review.status ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{review.address || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Placement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-2">{renderStars(review.placementStars)}</div>
                <p className="text-sm text-muted-foreground">{review.placementDescription || 'No description'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-2">{renderStars(review.facultyStars)}</div>
                <p className="text-sm text-muted-foreground">{review.facultyDescription || 'No description'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campus Life</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-2">{renderStars(review.campusLifeStars)}</div>
                <p className="text-sm text-muted-foreground">{review.campusLifeDescription || 'No description'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-2">{renderStars(review.suggestionsStars)}</div>
                <p className="text-sm text-muted-foreground">{review.suggestionDescription || 'No description'}</p>
              </CardContent>
            </Card>
          </div>

          {(review.studentIdImage || review.selfieImage) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {review.studentIdImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Student ID Image</p>
                  <Image
                    src={`${IMAGE_URL}/${review.studentIdImage}`}
                    alt="Student ID"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover border"
                  />
                </div>
              )}
              {review.selfieImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Selfie Image</p>
                  <Image
                    src={`${IMAGE_URL}/${review.selfieImage}`}
                    alt="Selfie"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-3">Features</p>
            <div className="flex flex-wrap gap-2">
              {booleanFields.map(([label, key]) => renderBooleanField(label, review[key]))}
              {review.lectureAsPerSession && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Lectures as per session</span>}
              {review.additionDoubtClass && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Additional Doubt Classes</span>}
              {review.projectAssignmentWorkshopStudyTools && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Project/Workshop Tools</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

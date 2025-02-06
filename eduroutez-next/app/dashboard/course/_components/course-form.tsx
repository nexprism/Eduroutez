'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ResponsiveTabsList,
  ResponsiveTabsTrigger,
  Tabs,
  TabsContent
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomEditor from '@/components/custom-editor';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import Image from 'next/image';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { CourseCategory,Institute } from '@/types';
import { toast } from 'sonner';

const coursePreviewType = [
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'yutube', label: 'Youtube' }
];
const courseTypes = [
  { value: 'All', label: 'All' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Online', label: 'Online' }

];


const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const visibilities = [
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'default', label: 'Default' }
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' }
];
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const formSchema = z.object({
  courseTitle: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  courseType: z.string({
    required_error: 'Please select a course type.'
  }),
  shortDescription: z.any().optional(),
  longDescription: z.any().optional(),

  category: z.string({
    required_error: 'Please select a category.'
  }),
  instituteCategory: z.string({
    required_error: 'Please select a category.'
  }),
  status: z.string({
    required_error: 'Please select a status.'
  }),
  visibility: z.string({
    required_error: 'Please select a visibility option.'
  }),
  language: z.string({
    required_error: 'Please select a language.'
  }),

  eligibility: z.string().optional(),
  cutOff: z.string().optional(),
  ranking: z.string().optional(),
  examAccepted: z.string().optional(),
  courseDurationYears: z.any().optional(),
  courseDurationMonths: z.any().optional(),

  courseOverview: z.string().optional(),

  courseEligibility: z.string().optional(),
  courseCurriculum: z.string().optional(),
  courseFee: z.string().optional(),
  courseOpportunities: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),

  coursePrice: z.any().optional(),
  courseDiscount: z.string().optional(),
  courseDiscountType: z.string().optional(),
  coursePreviewType: z.string().optional(),
  coursePreviewUrl: z.string().optional(),
  coursePreviewThumbnail: z.any().optional(),
  coursePreviewCover: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaImage: z.any().optional(),
  isCourseFree: z.enum(['free', 'notfree'], {
    required_error: 'You need to select one option.'
  }),
  isCourseDiscounted: z.enum(['yes', 'no']).optional(),
  applicationStartDate: z.date().optional(),
  applicationEndDate: z.date().optional(),
  isCoursePopular: z.boolean().optional(),
  isCourseTreanding: z.boolean().optional(),
});
console.log(FormData);

export default function CreateCourse() {
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = React.useState<
    string | null
  >(null);
  const [previewCoverUrl, setPreviewCoverUrl] = React.useState<string | null>(
    null
  );
  const [previewMetaImageUrl, setPreviewMetaImageUrl] = React.useState<
    string | null
  >(null);

  const [isPopularEnabled, setIsPopularEnabled] = useState(false);
  const [activeTab, setActiveTab] = React.useState('general');
  const fileInputThumbnailRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputMetaImageRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputCoverRef = React.useRef<HTMLInputElement | null>(null);
  const [isInstituteRole, setIsInstituteRole] = useState(false);

  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseTitle: '',
      shortDescription: '',
      longDescription: '',
      isCourseFree: 'free',
      isCourseDiscounted: 'no',
      isCoursePopular: false,  // Add this
      isCourseTreanding: false, 
    }
  });

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const instituteId = localStorage.getItem('instituteId');
    
    if (userRole === 'institute' && instituteId) {
      setIsInstituteRole(true);
      // Set the institute ID in the form
      form.setValue('instituteCategory', instituteId);
    }
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('coursePreviewThumbnail', file);
    } else {
      setPreviewThumbnailUrl(null);
      form.setValue('coursePreviewThumbnail', undefined);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('coursePreviewCover', file);
    } else {
      setPreviewCoverUrl(null);
      form.setValue('coursePreviewCover', undefined);
    }
  };

  const handleMetaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewMetaImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('metaImage', file);
    } else {
      setPreviewMetaImageUrl(null);
      form.setValue('metaImage', undefined);
    }
  };

  const triggerThumbnailFileInput = () => {
    fileInputThumbnailRef.current?.click();
  };

  const triggerMetaImageFileInput = () => {
    fileInputMetaImageRef.current?.click();
  };

  const triggerCoverFileInput = () => {
    fileInputCoverRef.current?.click();
  };
  const removeThumbnailImage = () => {
    setPreviewThumbnailUrl(null);
    form.setValue('coursePreviewThumbnail', undefined);
    if (fileInputThumbnailRef.current) {
      fileInputThumbnailRef.current.value = ''; // Reset the file input
    }
  };

  const removeCoverImage = () => {
    setPreviewCoverUrl(null);
    form.setValue('coursePreviewCover', undefined);
    if (fileInputCoverRef.current) {
      fileInputCoverRef.current.value = ''; // Reset the file input
    }
  };

  const removeMetaImage = () => {
    setPreviewMetaImageUrl(null);
    form.setValue('metaImage', undefined);
    if (fileInputMetaImageRef.current) {
      fileInputMetaImageRef.current.value = ''; // Reset the file input
    }
  };

  const fetchCategories = async () => {
    const response = await axiosInstance.get(`${apiUrl}/course-categories`);
    return response.data;
  };
  const {
    data: courseCategories = [],
    isLoading,
    error
  } = useQuery({ queryKey: ['course-categories'], queryFn: fetchCategories });

  //a
  // const fetchInstitute = async () => {
  //   const response = await axiosInstance.get(`${apiUrl}/institutes`);
  //   return response.data;
  // };

  const {
    data: instituteCategories = [],
  } = useQuery({
    queryKey: ['institutes'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institutes`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
        }
      });
      return response.data;
    }
  });

  // console.log(instituteCategories);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Your form submission logic here
      const formData = new FormData();
      formData.append('courseTitle', values.courseTitle);
      formData.append('shortDescription', values.shortDescription);
      formData.append('longDescription', values.longDescription);
      formData.append('courseType', values.courseType);
      formData.append('category', values.category);
      formData.append('status', values.status);
      formData.append('instituteCategory', values.instituteCategory);
      formData.append('visibility', values.visibility);
      formData.append('language', values.language);
      formData.append('isCoursePopular', values.isCoursePopular?.toString() || 'false');
      formData.append('isCourseTrending', values.isCourseTreanding?.toString() || 'false');

      if (values.examAccepted !== undefined) {
        formData.append('examAccepted', values.examAccepted);
      }
      if (values.eligibility !== undefined) {
        formData.append('eligibility', values.eligibility);
      }
      if (values.cutOff !== undefined) {
        formData.append('cutOff', values.cutOff);
      }
      if (values.ranking !== undefined) {
        formData.append('ranking', values.ranking);
      }
      if (values.courseDurationYears !== undefined) {
        formData.append('courseDurationYears', values.courseDurationYears);
      }
      if (values.courseDurationMonths !== undefined) {
        formData.append('courseDurationMonths', values.courseDurationMonths);
      }
      if (values.applicationStartDate !== undefined) {
        formData.append(
          'applicationStartDate',
          values.applicationStartDate.toISOString()
        );
      }
      if (values.applicationEndDate !== undefined) {
        formData.append(
          'applicationEndDate',
          values.applicationEndDate.toISOString()
        );
      }
      if (values.courseOverview !== undefined) {
        formData.append('courseOverview', values.courseOverview);
      }
      if (values.courseEligibility !== undefined) {
        formData.append('courseEligibility', values.courseEligibility);
      }
      if (values.courseCurriculum !== undefined) {
        formData.append('courseCurriculum', values.courseCurriculum);
      }
      if (values.courseFee !== undefined) {
        formData.append('courseFee', values.courseFee);
      }
      if (values.courseOpportunities !== undefined) {
        formData.append('courseOpportunities', values.courseOpportunities);
      }
      if (values.isCourseFree !== undefined) {
        formData.append('isCourseFree', values.isCourseFree);
      }
      if (values.isCourseDiscounted !== undefined) {
        formData.append('isCourseDiscounted', values.isCourseDiscounted);
      }
      if (values.coursePrice !== undefined) {
        formData.append('coursePrice', values.coursePrice);
      }
      if (values.courseDiscount !== undefined) {
        formData.append('courseDiscount', values.courseDiscount);
      }
      if (values.courseDiscountType !== undefined) {
        formData.append('courseDiscountType', values.courseDiscountType);
      }
      if (values.coursePreviewType !== undefined) {
        formData.append('coursePreviewType', values.coursePreviewType);
      }
      if (values.coursePreviewUrl !== undefined) {
        formData.append('coursePreviewUrl', values.coursePreviewUrl);
      }
      if (values.coursePreviewThumbnail !== undefined) {
        formData.append(
          'coursePreviewThumbnail',
          values.coursePreviewThumbnail
        );
      }
      if (values.coursePreviewCover !== undefined) {
        formData.append('coursePreviewCover', values.coursePreviewCover);
      }
      if (values.metaTitle !== undefined) {
        formData.append('metaTitle', values.metaTitle);
      }
      if (values.metaDescription !== undefined) {
        formData.append('metaDescription', values.metaDescription);
      }
      if (values.metaKeywords !== undefined) {
        formData.append('metaKeywords', values.metaKeywords);
      }
      if (values.metaImage !== undefined) {
        formData.append('metaImage', values.metaImage);
      }
      if(values.pros !== undefined){
        formData.append('pros', values.pros);
      }
      if(values.cons !== undefined){
        formData.append('cons', values.cons);
      }


      mutate(formData);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/course/${segments[4]}`
        : `${apiUrl}/course`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: isEdit ? 'patch' : 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = isEdit
        ? 'Course updated successfully'
        : 'Course created successfully';
      toast.success(message);
      form.reset();
      setPreviewThumbnailUrl(null);
      setPreviewCoverUrl(null);
      setPreviewMetaImageUrl(null);

      router.push('/dashboard/course');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });


  useEffect(() => {
    const fetchInstituteData = async () => {
      const id = localStorage.getItem('instituteId');
      try {
        console.log("Fetching institute data...");
        const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
        const instituteData = response.data.data;
        console.log("Institute data here:", instituteData);
        
        const plan = instituteData.plan;
        const popularCourseFeature = plan.features.find(
          (feature:any) => feature.key === 'Popular Courses'
        );
        
        // Enable checkbox only if feature value is "Yes"
        setIsPopularEnabled(popularCourseFeature?.value === "Yes");
      } catch (error) {
        console.log("Error fetching institute data:", error);
        setIsPopularEnabled(false);
      }
    };

    fetchInstituteData();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['category', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/course/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });
  React.useEffect(() => {
      if (course?.data) {
        form.reset({
          courseTitle: course.data.courseTitle,
          shortDescription: course.data.shortDescription,
          longDescription: course.data.longDescription,
          isCourseFree: course.data.isCourseFree,
          isCourseDiscounted: course.data.isCourseDiscounted,
          courseType: course.data.courseType,
          category: course.data.category,
          status: course.data.status,
          instituteCategory: course.data.instituteCategory,
          visibility: course.data.visibility,
          language: course.data.language,
          examAccepted: course.data.examAccepted,
          eligibility: course.data.eligibility,
          cutOff: course.data.cutOff,
          ranking: course.data.ranking,
          courseDurationYears: course.data.courseDurationYears,
          courseDurationMonths: course.data.courseDurationMonths,
          applicationStartDate: new Date(course.data.applicationStartDate),
          applicationEndDate: new Date(course.data.applicationEndDate),
          courseOverview: course.data.courseOverview,
          courseEligibility: course.data.courseEligibility,
          courseCurriculum: course.data.courseCurriculum,
          courseFee: course.data.courseFee,
          courseOpportunities: course.data.courseOpportunities,
          coursePrice: course.data.coursePrice,
          courseDiscount: course.data.courseDiscount,
          courseDiscountType: course.data.courseDiscountType,
          coursePreviewType: course.data.coursePreviewType,
          coursePreviewUrl: course.data.coursePreviewUrl,
          coursePreviewThumbnail: course.data.coursePreviewThumbnail,
          coursePreviewCover: course.data.coursePreviewCover,
          metaTitle: course.data.metaTitle,
          metaDescription: course.data.metaDescription,
          metaKeywords: course.data.metaKeywords,
          metaImage: course.data.metaImage,
      isCoursePopular: course.data.isCoursePopular || false,
      isCourseTreanding: course.data.isCourseTrending || false,
      pros: course.data.pros,
      cons: course.data.cons,
        });
      }
    }, [course, form]);


  
  return (
    <div className="container mx-auto space-y-6 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ResponsiveTabsList className="flex w-full justify-evenly">
          <ResponsiveTabsTrigger value="general">General</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="requirements">
            Requirements
          </ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="price">Price</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="media">Media</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="seo">SEO</ResponsiveTabsTrigger>
        </ResponsiveTabsList>
        <TabsContent value="general" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="courseTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Controller
                            name="shortDescription"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Controller
                            name="longDescription"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="courseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Course Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {courseTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Course Category" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {courseCategories &&
                              courseCategories?.data?.result?.length > 0
                                ? courseCategories.data.result.map(
                                    (category: CourseCategory) => (
                                      <SelectItem
                                        key={category._id}
                                        value={category._id}
                                      >
                                        {category.title}
                                      </SelectItem>
                                    )
                                  )
                                : null}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* a */}
                    <FormField
  control={form.control}
  name="instituteCategory"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Institute Category</FormLabel>
      {isInstituteRole ? (
        <div className="flex items-center space-x-2">
          <Input
            value={instituteCategories?.data?.result?.find((category: Institute) => category._id === field.value)?.instituteName || ''}
            readOnly
          />
        </div>
      ) : (
        <Select
          onValueChange={field.onChange}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select Institute" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {instituteCategories?.data?.result?.length > 0
              ? instituteCategories.data.result.map(
                  (category: Institute) => (
                    <SelectItem
                      key={category._id}
                      value={category._id}
                    >
                      {category.instituteName}
                    </SelectItem>
                  )
                )
              : <SelectItem value="">No Institutes Available</SelectItem>}
          </SelectContent>
        </Select>
      )}
      <FormMessage />
    </FormItem>
  )}
/>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {visibilities.map((visibility) => (
                                <SelectItem
                                  key={visibility.value}
                                  value={visibility.value}
                                >
                                  {visibility.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 

                 <FormField
      control={form.control}
      name="isCoursePopular"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!isPopularEnabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>
              Popular Course
            </FormLabel>
            <FormDescription>
              {isPopularEnabled 
                ? "Mark this course as popular"
                : "Popular course feature is not available in your current plan"}
            </FormDescription>
          </div>
        </FormItem>
      )}
    />


<FormField
  control={form.control}
  name="isCourseTreanding"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={!isPopularEnabled}

        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>
          Trending Course
        </FormLabel>
        <FormDescription>
        {isPopularEnabled 
                ? "Mark this course as popular"
                : "Trending course feature is not available in your current plan"}        </FormDescription>
      </div>
    </FormItem>
  )}
/>

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((language) => (
                                <SelectItem
                                  key={language.value}
                                  value={language.value}
                                >
                                  {language.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="examAccepted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Accepted</FormLabel>
                          <Input placeholder="Enter Exam Accepted" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eligibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eligibility</FormLabel>
                          <Input placeholder="Enter Eligibility" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cutOff"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cut off</FormLabel>
                          <Input placeholder="Enter Cut off" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ranking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ranking</FormLabel>
                          <Input placeholder="Enter Ranking" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="" className="text-md font-semibold">
                      Course Duration
                    </Label>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="courseDurationYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Year"
                                {...field}
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="courseDurationMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Months</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Months"
                                {...field}
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      <Label>Application Start Date</Label>
                      <FormField
                        control={form.control}
                        name="applicationStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-[240px] pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <= new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-4 flex flex-col gap-4 lg:mt-0">
                      <Label>Application End Date</Label>

                      <FormField
                        control={form.control}
                        name="applicationEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-[240px] pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date('1900-01-01')
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('requirements')}>
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requirements" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Course Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="courseOverview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Overview</FormLabel>
                        <FormControl>
                          <Controller
                            name="courseOverview"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseEligibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligibility</FormLabel>
                        <FormControl>
                          <Controller
                            name="courseEligibility"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseCurriculum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Curriculum</FormLabel>
                        <FormControl>
                          <Controller
                            name="courseCurriculum"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Fees</FormLabel>
                        <FormControl>
                          <Controller
                            name="courseFee"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


<FormField
                    control={form.control}
                    name="pros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pros</FormLabel>
                        <FormControl>
                          <Controller
                            name="pros"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

<FormField
                    control={form.control}
                    name="cons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cons</FormLabel>
                        <FormControl>
                          <Controller
                            name="cons"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="courseOpportunities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Career Opportunity</FormLabel>
                        <FormControl>
                          <Controller
                            name="courseOpportunities"
                            control={form.control}
                            render={({ field }) => (
                              <CustomEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('price')}>Next</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Course Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="isCourseFree"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        {/* <FormLabel>course price</FormLabel> */}
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="free" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                This course is free
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="notfree" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                This course is not free
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('isCourseFree') === 'notfree' && (
                    <>
                      <FormField
                        control={form.control}
                        name="coursePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Price</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Course Price"
                                {...field}
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isCourseDiscounted"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="no" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    This course does not have discount
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="yes" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    This course has discount
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {form.watch('isCourseFree') === 'notfree' &&
                    form.watch('isCourseDiscounted') === 'yes' && (
                      <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 ">
                          <FormField
                            control={form.control}
                            name="courseDiscountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Discount Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={'fixed'}>
                                      Fixed
                                    </SelectItem>
                                    <SelectItem value={'percentage'}>
                                      Percentage
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="courseDiscount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Course Discount"
                                    {...field}
                                    type="number"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('media')}>Next</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="media" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="coursePreviewType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Preview Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Course Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {coursePreviewType.map((type: any) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coursePreviewUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video url </FormLabel>
                        <Input placeholder="Add a vedio url" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="coursePreviewThumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail Image</FormLabel>
                          <span className="text-xs text-gray-500 ml-2">
          (Image size must be less than 1 MB - Recommended size: 446px x 290px)
        </span>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleThumbnailChange}
                                ref={fileInputThumbnailRef} // Reference to reset input
                                className="hidden "
                              />

                              {previewThumbnailUrl ? (
                                <div className="relative inline-block">
                                  <Image
                                    src={previewThumbnailUrl}
                                    alt="Preview"
                                    className="max-h-[200px] max-w-full rounded-md object-cover"
                                    width={1200}
                                    height={1200}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-0 top-0 -mr-2 -mt-2"
                                    onClick={removeThumbnailImage}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">
                                      Remove image
                                    </span>
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  onClick={triggerThumbnailFileInput}
                                  className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
                                >
                                  <Plus className="text-grey-400 h-10 w-10" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coursePreviewCover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image</FormLabel>
                          <span className="text-xs text-gray-500 ml-2">
          (Image size must be less than 1 MB - Recommended size: 446px x 290px)
        </span>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleCoverChange}
                                ref={fileInputCoverRef} // Reference to reset input
                                className="hidden "
                              />

                              {previewCoverUrl ? (
                                <div className="relative inline-block">
                                  <Image
                                    src={previewCoverUrl}
                                    alt="Preview"
                                    className="max-h-[200px] max-w-full rounded-md object-cover"
                                    width={1200}
                                    height={1200}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-0 top-0 -mr-2 -mt-2"
                                    onClick={removeCoverImage}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">
                                      Remove image
                                    </span>
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  onClick={triggerCoverFileInput}
                                  className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
                                >
                                  <Plus className="text-grey-400 h-10 w-10" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('seo')}>Next</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    if (Object.keys(errors).length > 0) {
                      toast.error(
                        'Please correct the errors in the form before submitting.'
                      );
                    }
                  })}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <Input placeholder="Enter meta Title" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keyword </FormLabel>
                        <Input placeholder="Enter meta Keywords" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description </FormLabel>
                        <Input placeholder="Enter Meta Description" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1">
                    <FormField
                      control={form.control}
                      name="metaImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Image</FormLabel>
                          <span className="text-xs text-gray-500 ml-2">
          (Image size must be less than 1 MB - Recommended size less then 1024px x 1024)
        </span>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleMetaImageChange}
                                ref={fileInputMetaImageRef} // Reference to reset input
                                className="hidden "
                              />

                              {previewMetaImageUrl ? (
                                <div className="relative inline-block">
                                  <Image
                                    src={previewMetaImageUrl}
                                    alt="Preview"
                                    className="max-h-[400px] max-w-full rounded-md object-cover"
                                    width={1200}
                                    height={1200}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-0 top-0 -mr-2 -mt-2"
                                    onClick={removeMetaImage}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">
                                      Remove image
                                    </span>
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  onClick={triggerMetaImageFileInput}
                                  className="border-grey-300 flex h-[400px] w-full cursor-pointer items-center justify-center rounded-md border"
                                >
                                  <Plus className="text-grey-400 h-10 w-10" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

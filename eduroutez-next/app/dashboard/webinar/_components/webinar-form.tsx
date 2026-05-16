'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { X, Plus, Rocket, Lock, Loader } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CustomEditor from '@/components/custom-editor';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }).nonempty({
    message: 'Title is required.'
  }),
  time: z.string().nonempty({
    message: 'Time is required.'
  }),
  date: z.string().nonempty({
    message: 'Date is required.'
  }).refine((val) => {
    const [year, month, day] = val.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 21);
    return selectedDate >= minDate;
  }, {
    message: 'Webinar must be scheduled at least 21 days in advance.'
  }),
  duration: z.string().nonempty({
    message: 'Duration is required.'
  }),
  webinarLink: z.string().url({
    message: 'Invalid URL format.'
  }).nonempty({
    message: 'Webinar Link is required.'
  }),
  description: z.string().nonempty({
    message: 'Description is required.'
  }),
  webinarCreatedBy: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file !== undefined, {
      message: 'Image is required.'
    })
    .refine((file) => !file || file.size <= 1024 * 1024, {
      message: 'Image size must be less than 1 MB.'
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
      }
    )
});
export default function WebinarForm() {
  const fileInputImageRef = React.useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [instituteId, setInstituteId] = useState<string | null>(null);


  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      time: '',
      date: '',
      duration: '',
      webinarLink: '',
      description: '',
      webinarCreatedBy:'',
      image: undefined
    }
  });

  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/webinar/${segments[4]}`
        : `${apiUrl}/webinar`;
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
        ? 'Webinar updated successfully'
        : 'Webinar created successfully';
      toast.success(message);
      form.reset();
      setPreviewImageUrl(null);
      router.push('/dashboard/webinar');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.explanation || error.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('time', values.time);
    formData.append('date', values.date);
    formData.append('duration', values.duration);
    formData.append('webinarLink', values.webinarLink);
    formData.append('description', values.description);
    formData.append('title', values.title);

    if (values.image) {
      formData.append('image', values.image);
    }

    const webinarCreatedBy = localStorage.getItem('instituteId');
    if (webinarCreatedBy) {
      formData.append('webinarCreatedBy', webinarCreatedBy);
    }

    mutate(formData);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('image', file);
    } else {
      setPreviewImageUrl(null);
      form.setValue('image', undefined);
    }
  };

  const triggerImageFileInput = () => {
    fileInputImageRef.current?.click();
  };

  const removeImage = () => {
    setPreviewImageUrl(null);
    form.setValue('image', undefined);
    if (fileInputImageRef.current) {
      fileInputImageRef.current.value = ''; // Reset the file input
    }
  };

  const { 
    data: category, 
    isLoading: isCategoryLoading 
  } = useQuery({
    queryKey: ['webinar', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/webinar/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (category?.data) {
      form.reset({
        title: category.data.title,
        time: category.data.time,
        date: category.data.date,
        duration: category.data.duration,
        webinarLink: category.data.webinarLink,
        description: category.data.description,
      });

      if (category.data.icon) {
        setPreviewImageUrl(`${IMAGE_URL}/${category.data.icon}`);
      }
    }
  }, [category, form]);
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedInstituteId = localStorage.getItem('instituteId');
    setRole(storedRole);
    setInstituteId(storedInstituteId);
  }, []);

  const { data: instituteData, isLoading: isInstituteLoading } = useQuery({
    queryKey: ['webinar-form-institute', instituteId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institute/${instituteId}`);
      return response.data.data;
    },
    enabled: role === 'institute' && !!instituteId,
  });

  const { data: monthlyWebinarCount, isLoading: isMonthlyWebinarCountLoading } = useQuery({
    queryKey: ['monthly-webinar-count', instituteId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/monthly-webinar-count/${instituteId}`);
      return response.data?.data?.[0]?.count || 0;
    },
    enabled: role === 'institute' && !!instituteId,
  });

  const { data: activePurchases, isLoading: isActivePurchasesLoading } = useQuery({
    queryKey: ['active-webinar-purchases', instituteId],
    queryFn: async () => {
      const response = await axiosInstance.get('/my-webinar-purchases', {
        params: { onlyActive: true }
      });
      return response.data?.data || [];
    },
    enabled: role === 'institute' && !!instituteId,
  });

  const webinarFeature = instituteData?.plan?.features?.find(
    (feature: any) => feature.key === 'Webinar'
  );
  const webinarLimit = Number(webinarFeature?.value || 0);
  const monthlyCount = Number(monthlyWebinarCount || 0);
  const subscriptionRemaining = Math.max(webinarLimit - monthlyCount, 0);
  const packageRemaining = (activePurchases || []).reduce(
    (sum: number, purchase: any) => sum + (purchase.remainingWebinars || 0),
    0
  );
  const canCreateWebinar = role !== 'institute' || subscriptionRemaining > 0 || packageRemaining > 0;
  const shouldPromptPurchase = role === 'institute' && subscriptionRemaining <= 0 && packageRemaining <= 0;
  const isQuotaLoading = role === 'institute' && (isInstituteLoading || isMonthlyWebinarCountLoading || isActivePurchasesLoading);

  if (isQuotaLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (shouldPromptPurchase) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Webinar Quota Reached
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Lock className="text-yellow-500 w-16 h-16" />
            </div>
            <p className="text-gray-600">
              Your subscription webinar limit is exhausted and you do not have any active webinar package left.
            </p>
            <div className="flex items-center">
              <Rocket className="mr-2 text-purple-500" size={20} />
              Buy a webinar package to continue creating webinars
            </div>
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/dashboard/webinar-packages">Buy Webinar Package</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCategoryLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto space-y-6 py-6">
      {role === 'institute' && (
        <Card className="mx-auto w-full border-dashed">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Webinar quota status</p>
              <p className="text-sm">
                Subscription remaining: <span className="font-semibold">{subscriptionRemaining}</span>
                {webinarLimit > 0 ? ` / ${webinarLimit}` : ''}
                {' '}| Package balance: <span className="font-semibold">{packageRemaining}</span>
              </p>
            </div>
            {subscriptionRemaining <= 0 && (
              <Button asChild variant="outline">
                <Link href="/dashboard/webinar-packages">Buy Webinar Package</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Webinar Information
          </CardTitle>
        </CardHeader>
        <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImageChange}
                          ref={fileInputImageRef} // Reference to reset input
                          className="hidden "
                        />

                        {previewImageUrl ? (
                          <div className="relative inline-block">
                            <Image
                              src={previewImageUrl}
                              alt="Preview"
                              className="max-h-[400px] max-w-full rounded-md object-cover"
                              width={1200}
                              height={400}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerImageFileInput}
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
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Controller
                        name="description"
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
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input type="string" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="webinarLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webinar Link</FormLabel>
                      <FormControl>
                        <Input type="string" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending || !canCreateWebinar}>
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
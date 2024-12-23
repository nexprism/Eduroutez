'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { CourseCategory } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  work: z.string(),
  image: z
    .instanceof(File)
    .optional()
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
  ,
    startDate: z.date({
      required_error: 'Start date is required.'
    }),
    endDate: z.date({
      required_error: 'End date is required.'
    })
});

export default function CourseCategoryForm() {
  const fileInputImageRef = React.useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(
    null
  );
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);

  console.log(segments);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      work: 'Promotion',
      startDate: undefined,
      endDate: undefined,
      image: undefined
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('endDate', values.endDate.toISOString());
    if (values.image) {
      formData.append('images', values.image);
    }

    mutate(formData);
  }

  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/promotion/${segments[4]}`
        : `${apiUrl}/promotion`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: isEdit ? 'patch' : 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      return response.data;
    },

    onSuccess: () => {
      const message = isEdit
        ? 'Media updated successfully'
        : 'Media created successfully';
      toast.success(message);
      form.reset();
      setPreviewImageUrl(null);
      router.push('/dashboard/promotion');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });

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

  const fetchCategories = async () => {
    const response = await axiosInstance.get(`${apiUrl}/promotions`);
    return response.data;
  };

  const {
    data: courseCategories = [],
    isLoading,
    error
  } = useQuery({ queryKey: ['promotion'], queryFn: fetchCategories });

  const { data: category } = useQuery({
    queryKey: ['promotion', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/promotion/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  console.log(category);

  React.useEffect(() => {
    if (category?.data && courseCategories?.data?.result) {
      // Find the matching parent category
      const parentCategory = courseCategories.data.result.find(
        (cat: CourseCategory) => cat._id === category.data.parentCategory
      );

      form.reset({
        title: category.data.title
      });

      if (category.data.icon) {
        setPreviewImageUrl(`${IMAGE_URL}/${category.data.icon}`);
      }
    }
  }, [category, courseCategories, form]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;
  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Promotion Information
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

              <div className="grid grid-cols-1">
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
              </div>

              <div className="mt-4 flex flex-col gap-4 grid-rows-2 lg:mt-0">
                <div className="flex flex-col gap-4">
                  <Label>Promotion Start Date</Label>
                  <FormField
                    control={form.control}
                    name="startDate"
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
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
                  <Label>Promotion End Date</Label>

                  <FormField
                    control={form.control}
                    name="endDate"
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date('1900-01-01')}
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
                <Button type="submit" disabled={isPending}>
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

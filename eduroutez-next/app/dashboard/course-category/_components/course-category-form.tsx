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
  parentCategory: z.string({
    required_error: 'Please select a parent category.'
  }),

  status: z.enum(['active', 'inactive'], {
    required_error: 'Please select a status.'
  }),
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
      status: 'active',
      image: undefined,
      parentCategory: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('parentCategory', values.parentCategory);
    formData.append('status', values.status === 'active' ? 'true' : 'false');
    if (values.image) {
      formData.append('icon', values.image);
    }

    mutate(formData);
  }

  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/course-category/${segments[4]}`
        : `${apiUrl}/course-category`;
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
        ? 'Course category updated successfully'
        : 'Course category created successfully';
      toast.success(message);
      form.reset();
      setPreviewImageUrl(null);
      router.push('/dashboard/course-category');
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
    const response = await axiosInstance.get(`${apiUrl}/course-categories`);
    return response.data;
  };

  const {
    data: courseCategories = [],
    isLoading,
    error
  } = useQuery({ queryKey: ['course-categories'], queryFn: fetchCategories });

  const { data: category } = useQuery({
    queryKey: ['category', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/course-category/${segments[4]}`
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
        title: category.data.title,
        status: category.data.status === true ? 'active' : 'inactive',
        parentCategory: parentCategory ? parentCategory._id : '' // Ensure valid parent category
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
            Course Information
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
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
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
                          <SelectItem value={'active'}>Active</SelectItem>
                          <SelectItem value={'inactive'}>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Icon</FormLabel>
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

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  date: z.date({ required_error: 'Please select a date.' }),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, { message: 'Image size must be less than 1 MB.' })
    .refine((file) => !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type), {
      message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.',
    }),
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

export default function NewsForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | ArrayBuffer | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = useState(false);

  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      image: null as File | null,
    },
  });

  // Check if the form is for editing
  useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  // Fetch existing data if editing
  const { data: news, isLoading } = useQuery({
    queryKey: ['news', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/news/data/${segments[4]}`);
      return response.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (news?.data) {
      reset({
        title: news.data.title,
        description: news.data.description,
        date: news.data.date ? parseISO(news.data.date) : new Date(),
      });
      if (news.data.image) {
        setPreviewImage(`${IMAGE_URL}/${news.data.image}`);
      }
    }
  }, [news, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setValue('image', file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setValue('image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { mutate, status } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/update-news/${segments[4]}`
        : `${apiUrl}/create-news`;
      const method = isEdit ? 'patch' : 'post';
      const response = await axiosInstance({
        url: endpoint,
        method,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'News updated successfully' : 'News created successfully');
      reset();
      setPreviewImage(null);
      router.push('/dashboard/news');
    },
    onError: (error) => {
      toast.error('Something went wrong');
      console.error(error);
    },
  });

  const onSubmit = async (values: any) => {
    const instituteId = localStorage.getItem('instituteId');
    if (!instituteId) {
      toast.error('Institute ID is missing.');
      return;
    }

    // Validate and handle date conversion
    if (!(values.date instanceof Date) || isNaN(values.date.getTime())) {
      toast.error('Please select a valid date.');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('date', values.date.toISOString());
    formData.append('instituteId', instituteId);

    if (values.image) formData.append('image', values.image);

    mutate(formData);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEdit ? 'Update News Article' : 'Create News Article'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div>
                    <label>Title</label>
                    <Input placeholder="Enter news title" {...field} />
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label>Description</label>
                    <Textarea placeholder="Enter news description" {...field} />
                  </div>
                )}
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <label>Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn('w-full pl-3 text-left', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(date) => field.onChange(date || new Date())} />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />

              <div>
                <label>Featured Image</label>
                <div className="space-y-4">
                  <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                  {previewImage ? (
                    <div className="relative inline-block">
                      <Image src={typeof previewImage === 'string' ? previewImage : ''} alt="Preview" width={1200} height={400} className="rounded-md" />
                      <Button type="button" variant="destructive" className="absolute top-2 right-2" onClick={removeImage}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="h-[200px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg cursor-pointer">
                      <Plus className="h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload image</p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {status === 'pending' ? 'Submitting...' : isEdit ? 'Update News Article' : 'Create News Article'}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

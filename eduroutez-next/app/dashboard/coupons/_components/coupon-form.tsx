'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().min(2, { message: 'Description is required.' }),
  mode: z.enum(['ONLINE', 'OFFLINE'], { required_error: 'Mode is required.' }),
  discount: z
    .string()
    .min(1, { message: 'Discount is required.' }),
  expiryDate: z.string().min(1, { message: 'Expiry date is required.' }),
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

export default function CouponForm() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      mode: 'ONLINE',
      discount: '',
      expiryDate: '',
      image: undefined
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance({
        url: `${apiUrl}/coupon`,
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Coupon created successfully');
      form.reset();
      setPreviewImageUrl(null);
      router.refresh();
    },
    onError: () => {
      toast.error('Something went wrong while creating coupon');
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('mode', values.mode);
    formData.append('discount', values.discount);
    formData.append('expiryDate', values.expiryDate);

    if (values.image) {
      formData.append('image', values.image);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewImageUrl(null);
    form.setValue('image', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create Coupon</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter coupon title" {...field} />
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
                    <Input placeholder="Enter coupon description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONLINE">ONLINE</SelectItem>
                          <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter discount percentage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {previewImageUrl ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="max-h-[200px] max-w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-0 top-0 -mr-2 -mt-2"
                            onClick={removeImage}
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <Button type="button" variant="outline" onClick={triggerFileInput}>
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

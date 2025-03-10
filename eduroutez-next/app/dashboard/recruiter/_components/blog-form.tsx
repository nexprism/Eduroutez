'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function RecruiterImageForm() {
  const fileInputImageRef = React.useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined
    }
  });

  function onSubmit(values: FormValues) {
    const instituteId = localStorage.getItem('instituteId');
    if (!instituteId) {
      toast.error('Institute ID not found');
      return;
    }

    const formData = new FormData();
    formData.append('blogCreatedBy', instituteId);
    if(instituteId) {
      formData.append('instituteId', instituteId);
    }
    
    if (values.image) {
      formData.append('image', values.image);
    }
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/recruiter/${segments[4]}`
        : `${apiUrl}/recruiter`;
      const response = await axiosInstance({
        url: endpoint,
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
        ? 'Image updated successfully'
        : 'Image uploaded successfully';
      toast.success(message);
      form.reset();
      setPreviewImageUrl(null);
      router.push('/dashboard/recruiter');
    },
    onError: (error) => {
      toast.error('Something went wrong');
      console.error('Submission error:', error);
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

  const removeImage = () => {
    setPreviewImageUrl(null);
    form.setValue('image', undefined);
    if (fileInputImageRef.current) {
      fileInputImageRef.current.value = '';
    }
  };

  const triggerImageFileInput = () => {
    fileInputImageRef.current?.click();
  };

  const { data: blog } = useQuery({
    queryKey: ['blog', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit
  });

  React.useEffect(() => {
    if (blog?.data && blog.data.image) {
      setPreviewImageUrl(`${IMAGE_URL}/${blog.data.image}`);
    }
  }, [blog]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Update Image' : 'Upload Image'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        ref={fileInputImageRef}
                        className="hidden"
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
                      <p className="text-sm text-gray-500">
                        Only PNG, JPEG, and WEBP formats are allowed. Maximum size: 1 MB.
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

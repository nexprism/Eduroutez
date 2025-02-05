'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import CustomEditor from '@/components/custom-editor';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  category: z
    .string()
    .min(1, { message: 'Please select a category.' })
    .refine(
      (value) => {
        const category = value;
        return category !== 'Select a category';
      },
      {
        message: 'Please select a category.'
      }
    ),
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
    ),
  thumbnail: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, {
      message: 'Thumbnail size must be less than 1 MB.'
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid thumbnail format. Only PNG, JPEG, and WEBP are allowed.'
      }
    ),
  description: z.string().min(1, { message: 'Description is required.' })
});

type FormValues = z.infer<typeof formSchema>;

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function BlogForm() {
  const fileInputImageRef = React.useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const [thumbnail, setThumbnail] = React.useState<{ file: File; preview: string } | null>(null);
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
      title: '',
      category: '',
      description: '',
      thumbnail: undefined
    }
  });

  function onSubmit(values: FormValues) {
    const instituteId = localStorage.getItem('instituteId');
    if (!instituteId) {
      toast.error('Institute ID not found');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('blogCreatedBy', instituteId);
    if(instituteId) {
      formData.append('instituteId', instituteId);
    }
    
    if (values.image) {
      formData.append('images', values.image);
    }

    // Append thumbnail
    if (thumbnail) {
      formData.append('thumbnail', thumbnail.file);
    }

    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/blog/${segments[4]}`
        : `${apiUrl}/blog`;
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
        ? 'Blog updated successfully'
        : 'Blog created successfully';
      toast.success(message);
      form.reset();
      setPreviewImageUrl(null);
      setThumbnail(null);
      router.push('/dashboard/blog');
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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size <= 1024 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnail({
            file,
            preview: reader.result as string
          });
        };
        reader.readAsDataURL(file);
        form.setValue('thumbnail', file);
      } else {
        toast.error(`${file.name} is too large or has an invalid format`);
      }
    } else {
      setThumbnail(null);
      form.setValue('thumbnail', undefined);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    form.setValue('thumbnail', undefined);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
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

  const triggerThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  const { data: blog } = useQuery({
    queryKey: ['blog', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/blog/${segments[4]}`);
      return response.data;
    },
    enabled: isEdit
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/blog-category`);
      return response.data.data.result;
    }
  });

  React.useEffect(() => {
    if (blog?.data) {
      form.reset({
        title: blog.data.title,
        category: blog.data.category,
        description: blog.data.description,
      });

      if (blog.data.image) {
        setPreviewImageUrl(`${IMAGE_URL}/${blog.data.image}`);
      }
      
      // Load existing thumbnail if any
      if (blog.data.thumbnail) {
        setThumbnail({
          preview: `${IMAGE_URL}/${blog.data.thumbnail}`,
          file: new File([], blog.data.thumbnail) // placeholder file object
        });
      }
    }
  }, [blog, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Update Blog' : 'Create Blog'}
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
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
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
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail Section */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleThumbnailChange}
                        ref={thumbnailInputRef}
                        className="hidden"
                      />

                      {thumbnail ? (
                        <div className="relative inline-block">
                          <Image
                            src={thumbnail.preview}
                            alt="Thumbnail"
                            className="h-40 w-full rounded-md object-cover"
                            width={200}
                            height={160}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-0 top-0 -mr-2 -mt-2"
                            onClick={removeThumbnail}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove thumbnail</span>
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={triggerThumbnailInput}
                          className="border-grey-300 flex h-40 w-full cursor-pointer items-center justify-center rounded-md border"
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
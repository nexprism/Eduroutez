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
  stream: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.any().optional(),
  coverImages: z.array(z.any()).optional(),
});

function BlogForm(props) {
  const [previewImageUrls, setPreviewImageUrls] = React.useState<string[]>([]);
  const [thumbnail, setThumbnail] = React.useState<{ file: File; preview: string } | null>(null);
  const fileInputImageRef = React.useRef<HTMLInputElement>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const isEdit = Boolean(segments[4]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || '';

  type BlogFormValues = z.infer<typeof formSchema>;
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      stream: '',
      description: '',
      thumbnail: undefined,
      coverImages: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrls([reader.result as string]);
      };
      reader.readAsDataURL(file);
      form.setValue('coverImages', [file]);
    } else {
      setPreviewImageUrls([]);
      form.setValue('coverImages', undefined);
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

  const removeCoverImage = (index: number) => {
    setPreviewImageUrls((prev) => prev.filter((_, i) => i !== index));
    const files = form.getValues('coverImages') || [];
    const newFiles = files.filter((_: any, i: number) => i !== index);
    form.setValue('coverImages', newFiles.length > 0 ? newFiles : undefined);
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
    enabled: isEdit,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/blog-category?page=0&limit=200`);
      return response.data.data.result;
    }
  });

  const { data: streams } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/streams`, {
        params: {
          page: 0,
          limit: 200
        }
      });
      return response.data.data.result;
    }
  });

  React.useEffect(() => {
    if (blog?.data) {
      form.reset({
        title: blog.data.title,
        category: blog.data.category,
        stream: blog.data.stream,
        description: blog.data.description,
      });
      if (blog.data.coverImages && Array.isArray(blog.data.coverImages)) {
        setPreviewImageUrls(blog.data.coverImages.map((img: string) => `${IMAGE_URL}/${img}`));
      }
      if (blog.data.thumbnail) {
        setThumbnail({
          preview: `${IMAGE_URL}/${blog.data.thumbnail}`,
          file: new File([], blog.data.thumbnail)
        });
      }
    }
  }, [blog, form]);

  const handleCoverImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const readers = files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((urls) => {
        setPreviewImageUrls(urls);
      });
      form.setValue('coverImages', files);
    } else {
      setPreviewImageUrls([]);
      form.setValue('coverImages', undefined);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('category', data.category);
      if (data.stream) formData.append('stream', data.stream);
      if (data.description) formData.append('description', data.description);
      if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
      if (data.coverImages && Array.isArray(data.coverImages)) {
        data.coverImages.forEach((file: File) => {
          formData.append('images', file);
        });
      }

      let response;
      if (isEdit) {
        response = await axiosInstance.patch(`${apiUrl}/blog/${segments[4]}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axiosInstance.post(`${apiUrl}/blog`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(response.data?.message || (isEdit ? 'Blog updated successfully' : 'Blog created successfully'));
      router.push('/dashboard/blog');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  const isSubmitting = false; // Replace with actual submitting state if needed

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
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {categories?.map((category: any) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
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
              name="stream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stream" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {streams?.map((stream: any) => (
                        <SelectItem key={stream._id} value={stream._id}>
                          {stream.name}
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

            <FormField
              control={form.control}
              name="coverImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        multiple
                        onChange={handleCoverImagesChange}
                        ref={fileInputImageRef}
                        className="hidden"
                      />
                      {previewImageUrls.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                          {previewImageUrls.map((url, idx) => (
                            <div key={idx} className="relative inline-block">
                              <Image
                                src={url}
                                alt={`Preview ${idx + 1}`}
                                className="max-h-[200px] max-w-full rounded-md object-cover"
                                width={300}
                                height={200}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-0 top-0 -mr-2 -mt-2"
                                onClick={() => removeCoverImage(idx)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove image</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputImageRef.current?.click()}
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default BlogForm;


'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import CustomEditor from '@/components/custom-editor';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';

// Update form schema to include image
const formSchema = z.object({
  title: z.string().nonempty('Title is required'),
  status: z.string().optional(),
  description: z.string().nonempty('Content is required'),
  stream: z.string().optional(),
  level: z.string().optional(),
  image: z.instanceof(File)
    .optional()
    .nullable()
    .refine((file) => {
      // Only validate if file is provided (for new uploads)
      if (file === null || file === undefined) return true;
      return file.size <= 1024 * 1024;
    }, {
      message: 'Image size must be less than 1 MB.'
    })
    .refine((file) => {
      // Only validate if file is provided (for new uploads)
      if (file === null || file === undefined) return true;
      return ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
    }, {
      message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
    })
});

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

export default function CounselorForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const [streams, setStreams] = React.useState<{ _id: string; name: string }[]>([]);
  const [pageDataLoaded, setPageDataLoaded] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [rawData, setRawData] = React.useState<{
    title?: string;
    description?: string;
    status?: string;
    stream?: string;
    level?: string;
    image?: string;
  } | null>(null);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: '',
      stream: '',
      level: '',
      image: undefined
    }
  });

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const levels = [
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'masters', label: 'Masters' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'phd', label: 'PhD' }
  ];

  // Fetch streams from API
  const { data: streamsData } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/streams?page=0&limit=200`);
      console.log('Streams API response:', response.data);
      return response.data;
    }
  });

  React.useEffect(() => {
    if (streamsData) {
      let streamsList = [];
      // Handle different possible response structures
      if (streamsData.data?.result) {
        streamsList = streamsData.data.result;
      } else if (streamsData.result) {
        streamsList = streamsData.result;
      } else if (Array.isArray(streamsData.data)) {
        streamsList = streamsData.data;
      }

      console.log('Processed streams data:', streamsList);
      setStreams(streamsList);
    }
  }, [streamsData]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting form with values:', values);

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);

    if (values.status) formData.append('status', values.status);
    if (values.stream) formData.append('stream', values.stream);
    if (values.level) formData.append('level', values.level);

    // Handle the image field
    if (values.image instanceof File) {
      formData.append('image', values.image);
    } else if (typeof imagePreview === 'string' && imagePreview && isEdit && rawData?.image) {
      // If it's a string URL in edit mode, pass it as is
      formData.append('image', rawData.image);
    }

    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/page/${segments[4]}`
        : `${apiUrl}/page`;
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
        ? 'Page updated successfully'
        : 'Page created successfully';
      toast.success(message);
      form.reset();
      setImagePreview(null);
      router.push('/dashboard/manage-page');
    },
    onError: (error: any) => {
      console.error('Form submission error:', error);
      const errorMessage = error?.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    }
  });

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['page', segments[4]],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/page/${segments[4]}`);
        console.log('Page data response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching page data:', error);
        return null;
      }
    },
    enabled: isEdit, // Only fetch when in edit mode
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Directly set the raw data when we get it
  React.useEffect(() => {
    if (pageData && pageData.data) {
      setRawData(pageData.data);
    }
  }, [pageData]);

  // IMPORTANT: Set form values after page data is loaded
  React.useEffect(() => {
    if (isEdit && rawData && !pageDataLoaded) {
      console.log('Setting form values from raw data:', rawData);

      // First set individual fields
      form.setValue('title', rawData.title || '');
      form.setValue('description', rawData.description || '');
      form.setValue('status', rawData.status || '');
      form.setValue('stream', rawData.stream || '');
      form.setValue('level', rawData.level || '');

      // Set image preview if exists
      if (rawData.image) {
        setImagePreview(`${rawData.image}`);
      }

      // Then force a re-render
      setTimeout(() => {
        setPageDataLoaded(true);
      }, 100);
    }
  }, [rawData, form, isEdit, pageDataLoaded]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size <= 1024 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        form.setValue('image', file);

        // Create a preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is too large or has an invalid format`);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageFileInput = () => {
    fileInputRef.current?.click();
  };

  if (pageLoading) {
    return <div className="flex justify-center p-10">Loading form data...</div>;
  }

  // Helper functions to get labels for selected values
  const getStatusLabel = (value: any) => {
    if (!value) return "Select Status";
    const status = statuses.find(s => s.value === value);
    return status ? status.label : "Select Status";
  };

  const getLevelLabel = (value: any) => {
    if (!value) return "Select Level";
    const level = levels.find(l => l.value === value);
    return level ? level.label : "Select Level";
  };

  const getStreamName = (id: any) => {
    if (!id || streams.length === 0) return "Select Stream";
    const stream = streams.find(s => s._id === id);
    return stream ? stream.name : "Select Stream";
  };

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Update Page' : 'Add Page'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              if (Object.keys(errors).length > 0) {
                console.log('Form errors:', errors);
                toast.error(
                  'Please correct the errors in the form before submitting.'
                );
              }
            })}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Write title" {...field} />
                    </FormControl>
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
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {getStatusLabel(field.value)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
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
                name="stream"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {getStreamName(field.value)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {streams.map((stream) => (
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
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {getLevelLabel(field.value)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image upload field with improved preview */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                          className="hidden"
                        />

                        {imagePreview ? (
                          <div className="relative inline-block w-full">
                            {imagePreview.includes('data:') ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-[400px] max-w-full rounded-md object-cover"
                              />
                            ) : (
                              <Image
                                // Ensure proper URL construction with path joining
                                src={`${IMAGE_URL}/${imagePreview.replace(/^\//, '')}`}
                                alt="Preview"
                                className="max-h-[400px] max-w-full rounded-md object-cover"
                                width={1200}
                                height={400}
                              />
                            )}
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
                        <p className="text-xs text-gray-500">
                          Maximum file size: 1MB. Accepted formats: PNG, JPEG, WEBP
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
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
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
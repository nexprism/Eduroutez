'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
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
  counselorType: z.string().optional(),
  coverImages: z
    .array(z.instanceof(File)
      .refine((file) => file.size <= 1024 * 1024, {
        message: 'Image size must be less than 1 MB.'
      })
      .refine((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type), {
        message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
      })
    )
    .min(1, { message: 'At least one cover image is required.' })
    .optional(),
  thumbnail: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, {
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid thumbnail format. Only PNG, JPEG, and WEBP are allowed.'
      }
    ),  
  eligibility: z.string(),
  jobRoles: z.string(),
  opportunity: z.string(),
  topColleges: z.string(),
  description: z.string()
});

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function CounselorForm() {
  const fileInputImageRef = React.useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Memoize default form values
  const defaultFormValues = React.useMemo(() => ({
    title: '',
    category: '',
    description: '',
    eligibility: '',
    jobRoles: '',
    opportunity: '',
    topColleges: '',
    counselorType: '',
    thumbnail: undefined,
    coverImages: []
  }), []);

  // Create form with stable configuration
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues
  });

  // State for edit mode and form images
  const [formState, setFormState] = React.useState({
    isEdit: false,
    previewImageUrl: null as string | null,
    thumbnail: null as { file: File; preview: string } | null
  });

  // Fetch counselor data if in edit mode
  const segments = pathname.split('/');
  const shouldEdit = segments.length === 5 && segments[3] === 'update';
  const careerId = shouldEdit ? segments[4] : null;
  const { data: counselor } = useQuery({
    queryKey: careerId ? ['career', careerId] : ['career', 'new'],
    queryFn: async () => {
      if (!careerId) return null;
      const response = await axiosInstance.get(`${apiUrl}/career/${careerId}`);
      return response.data;
    },
    enabled: !!careerId
  });

  // Effect to set edit mode and reset form
  React.useEffect(() => {
    setFormState(prev => {
      if (prev.isEdit !== shouldEdit) {
        return {
          ...prev,
          isEdit: shouldEdit,
          previewImageUrl: null,
          thumbnail: null
        };
      }
      return prev;
    });
    // Reset form when not in edit mode
    if (!shouldEdit) {
      form.reset(defaultFormValues);
    }
  }, [pathname, form, defaultFormValues, shouldEdit]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['career-categories'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/career-category?page=0`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Populate form when counselor data is loaded
  React.useEffect(() => {
    if (counselor) {
      // Reset form with all fetched data fields
      form.reset({
        title: counselor.title || '',
        category: counselor.category || '',
        description: counselor.description || '',
        eligibility: counselor.eligibility || '',
        jobRoles: counselor.jobRoles || '',
        opportunity: counselor.opportunity || '',
        topColleges: counselor.topColleges || '',
        counselorType: counselor.counselorType || '',
        thumbnail: undefined,
        coverImages: []
      });

      // Update cover image previews
      if (counselor.coverImages && Array.isArray(counselor.coverImages)) {
        setPreviewImageUrls(counselor.coverImages.map((img: string) => `${IMAGE_URL}/${img}`));
      }

      // Update thumbnail preview
      setFormState(prev => ({
        ...prev,
        thumbnail: counselor.thumbnail
          ? {
              file: new File([], 'existing-thumbnail'),
              preview: `${IMAGE_URL}/${counselor.thumbnail}`
            }
          : null
      }));
    }
  }, [counselor, form]);

  // Image change handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({
          ...prev,
          previewImageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      form.setValue('image', file);
    } else {
      setFormState(prev => ({
        ...prev,
        previewImageUrl: null
      }));
      form.setValue('image', undefined);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size <= 1024 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormState(prev => ({
            ...prev,
            thumbnail: {
              file,
              preview: reader.result as string
            }
          }));
        };
        reader.readAsDataURL(file);
        form.setValue('thumbnail', file);
      } else {
        toast.error(`${file.name} is too large or has an invalid format`);
      }
    } else {
      setFormState(prev => ({
        ...prev,
        thumbnail: null
      }));
      form.setValue('thumbnail', undefined);
    }
  };

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

  const removeCoverImage = (index: number) => {
    setPreviewImageUrls((prev) => prev.filter((_, i) => i !== index));
    const files = form.getValues('coverImages') || [];
    const newFiles = files.filter((_: any, i: number) => i !== index);
    form.setValue('coverImages', newFiles.length > 0 ? newFiles : undefined);
    if (fileInputImageRef.current) {
      fileInputImageRef.current.value = '';
    }
  };

  // Submission handler
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const segments = pathname.split('/');
      const endpoint = formState.isEdit
        ? `${apiUrl}/career/${segments[4]}`
        : `${apiUrl}/career`;
      const response = await axiosInstance({
        url: endpoint,
        method: formState.isEdit ? 'patch' : 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      const message = formState.isEdit
        ? 'Career updated successfully'
        : 'Career created successfully';
      toast.success(message);
      form.reset(defaultFormValues);
      setFormState(prev => ({
        ...prev,
        previewImageUrl: null,
        thumbnail: null
      }));
      router.push('/dashboard/career');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });

  // Form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    const instituteId = localStorage.getItem('instituteId');
    
    if (!instituteId) {
      toast.error('Institute ID not found. Please login again.');
      return;
    }

    formData.append('instituteId', instituteId);
    formData.append('title', values.title);
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('eligibility', values.eligibility);
    formData.append('jobRoles', values.jobRoles);
    formData.append('opportunity', values.opportunity);
    formData.append('topColleges', values.topColleges);
    
    
    if (values.thumbnail) {
      formData.append('thumbnail', values.thumbnail);
    }

    if (values.coverImages && Array.isArray(values.coverImages)) {
      values.coverImages.forEach((file) => {
        formData.append('images', file);
      });
    }

    mutate(formData);
  };

  // Render methods
  const removeImage = () => {
    // Deprecated: No single image field in form. Remove logic.
  };

  const removeThumbnail = () => {
    setFormState(prev => ({
      ...prev,
      thumbnail: null
    }));
    form.setValue('thumbnail', undefined);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const [previewImageUrls, setPreviewImageUrls] = React.useState<string[]>([]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Career
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Rest of the form remains the same as in the original component */}
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        {categories?.data.result.map((category: any) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {/* Image and Thumbnail Fields */}

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
                        <>
                          <div className="flex flex-wrap gap-4">
                            {previewImageUrls.map((url, idx) => (
                              <div key={url} className="relative inline-block">
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
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => fileInputImageRef.current?.click()}
                          >
                            Add Image
                          </Button>
                        </>
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

              <FormField
                control={form.control}
                name="thumbnail"
                render={() => (
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

                        {formState.thumbnail ? (
                          <div className="relative inline-block">
                            <Image
                              src={formState.thumbnail.preview}
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
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="border-grey-300 flex h-40 w-full cursor-pointer items-center justify-center rounded-md border"
                          >
                            <Plus className="text-grey-400 h-10 w-10" />
                          </div>
                        )}
                      </div>
                    </FormControl>
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
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Controller
                        name="eligibility"
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
                name="jobRoles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Roles</FormLabel>
                    <FormControl>
                      <Controller
                        name="jobRoles"
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
                name="opportunity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity</FormLabel>
                    <FormControl>
                      <Controller
                        name="opportunity"
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
                name="topColleges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Top Institutes</FormLabel>
                    <FormControl>
                      <Controller
                        name="topColleges"
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

            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
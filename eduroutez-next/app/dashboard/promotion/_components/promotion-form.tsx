'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { X, ImageIcon } from 'lucide-react';

import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

// Define all promotion locations with their requirements
const PROMOTION_LOCATIONS = {
  // Blog Page
  BLOG_PAGE: {
    id: 'BLOG_PAGE',
    label: 'Blog Page',
    width: 300,
    height: 250,
    category: 'Blog',
    description: 'Advertisement space on blog posts'
  },

  // Institute Pages
  INSTITUTE_PAGE: {
    id: 'INSTITUTE_PAGE',
    label: 'Institute Page Banner',
    width: 300,
    height: 250,
    category: 'Institute',
    description: 'Main banner on institute profile pages'
  },

  // Home Page
  HOME_PAGE: {
    id: 'HOME_PAGE',
    label: 'Home Page Banner',
    width: 728,
    height: 90,
    category: 'Home',
    description: 'Main promotion on home page'
  },

  // Review Page
  REVIEW_PAGE: {
    id: 'REVIEW_PAGE',
    label: 'Review Page',
    width: 728,
    height: 90,
    category: 'Review',
    description: 'Banner on review pages'
  },

  // Career Page
  CAREER_PAGE: {
    id: 'CAREER_PAGE',
    label: 'Career Page',
    width: 728,
    height: 90,
    category: 'Career',
    description: 'Banner on career pages'
  },

  // Courses Page
  COURSES_PAGE: {
    id: 'COURSES_PAGE',
    label: 'Courses Page',
    width: 728,
    height: 90,
    category: 'Courses',
    description: 'Banner on courses listing'
  },

  // Counseling Page
  COUNSELING_PAGE_MAIN: {
    id: 'COUNSELING_PAGE_MAIN',
    label: 'Counseling Page Main',
    width: 728,
    height: 90,
    category: 'Counseling',
    description: 'Main banner on counseling page'
  },
  COUNSELING_PAGE_SIDEBAR: {
    id: 'COUNSELING_PAGE_SIDEBAR',
    label: 'Counseling Page Sidebar',
    width: 250,
    height: 250,
    category: 'Counseling',
    description: 'Sidebar promotion on counseling page'
  },

  // Q&A Page
  QA_PAGE: {
    id: 'QA_PAGE',
    label: 'Q&A Page',
    width: 250,
    height: 250,
    category: 'Q&A',
    description: 'Advertisement space on Q&A section'
  }
} as const;

// Group locations by category
const LOCATION_CATEGORIES = Object.values(PROMOTION_LOCATIONS).reduce((acc, location) => {
  if (!acc[location.category]) {
    acc[location.category] = [];
  }
  acc[location.category].push(location);
  return acc;
}, {} as Record<string, typeof PROMOTION_LOCATIONS[keyof typeof PROMOTION_LOCATIONS][]>);

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  location: z.enum(Object.keys(PROMOTION_LOCATIONS) as [keyof typeof PROMOTION_LOCATIONS, ...Array<keyof typeof PROMOTION_LOCATIONS>], {
    required_error: 'Please select a location'
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
    ),
  startDate: z.date({
    required_error: 'Start date is required.'
  }),
  endDate: z.date({
    required_error: 'End date is required.'
  })
});

type FormValues = z.infer<typeof formSchema>;

export default function PromotionForm() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
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
      location: undefined,
      startDate: undefined,
      endDate: undefined,
      image: undefined
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/promotion/${segments[4]}`
        : `${apiUrl}/promotion`;
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
      toast.success(isEdit ? 'Promotion updated successfully' : 'Promotion created successfully');
      router.push('/dashboard/promotion');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });

  const { data: existingPromotion } = useQuery({
    queryKey: ['promotion', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/promotion/${segments[4]}`);
      return response.data;
    },
    enabled: isEdit
  });

  React.useEffect(() => {
    if (existingPromotion?.data) {
      form.reset({
        title: existingPromotion.data.title,
        location: existingPromotion.data.location,
        startDate: new Date(existingPromotion.data.startDate),
        endDate: new Date(existingPromotion.data.endDate)
      });
      if (existingPromotion.data.image) {
        setPreviewUrl(`${IMAGE_URL}/${existingPromotion.data.image}`);
      }
    }
  }, [existingPromotion, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new window.Image();
      img.onload = () => {
        const location = form.getValues('location');
        if (location) {
          const requirements = PROMOTION_LOCATIONS[location];
          if (img.width !== requirements.width || img.height !== requirements.height) {
            toast.error(`Image must be exactly ${requirements.width}x${requirements.height} pixels for this location`);
            removeImage();
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
          form.setValue('image', file);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue('image', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('location', values.location);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('endDate', values.endDate.toISOString());
    if (values.image) {
      formData.append('image', values.image);
    }
    mutate(formData);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
            </h1>
            <p className="mt-2 text-gray-600">
              Configure your promotion details including placement, timing, and creative assets
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Title
                </label>
                <input
                  {...form.register('title')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter a descriptive title"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Location Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement Location
                </label>
                <select
                  {...form.register('location')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select placement location</option>
                  {Object.entries(LOCATION_CATEGORIES).map(([category, locations]) => (
                    <optgroup key={category} label={category}>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.label} ({location.width}x{location.height}px)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {form.getValues('location') && (
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Required dimensions: {PROMOTION_LOCATIONS[form.getValues('location')].width}x
                      {PROMOTION_LOCATIONS[form.getValues('location')].height}px
                      <br />
                      {PROMOTION_LOCATIONS[form.getValues('location')].description}
                    </p>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                />

                {previewUrl ? (
                  <div className="relative inline-block bg-gray-100 p-4 rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      className="rounded-lg"
                      width={form.getValues('location') ? 
                        PROMOTION_LOCATIONS[form.getValues('location')].width : 
                        300}
                      height={form.getValues('location') ? 
                        PROMOTION_LOCATIONS[form.getValues('location')].height : 
                        250}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
                    style={{
                      width: form.getValues('location') ? 
                        `${PROMOTION_LOCATIONS[form.getValues('location')].width}px` : 
                        '100%',
                      height: form.getValues('location') ? 
                        `${PROMOTION_LOCATIONS[form.getValues('location')].height}px` : 
                        '200px',
                    }}
                  >
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload promotion image
                    </p>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...form.register('startDate')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...form.register('endDate')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin">⌛</span>
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </span>
              ) : (
                <span>{isEdit ? 'Update Promotion' : 'Create Promotion'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

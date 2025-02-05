'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';
import { X, ImageIcon, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// Pricing configuration
const LOCATION_PRICING = {
  BLOG_PAGE: 1000,
  INSTITUTE_PAGE: 2000,
  HOME_PAGE: 2000,
  REVIEW_PAGE: 1500,
  CAREER_PAGE: 1000,
  COURSES_PAGE: 1500,
  COUNSELING_PAGE_MAIN: 2500,
  COUNSELING_PAGE_SIDEBAR: 2000,
  QA_PAGE: 1000
};

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
      (file) => !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
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
}).refine((data) => data.startDate <= data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type FormValues = z.infer<typeof formSchema>;

export default function PromotionForm() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [numberOfDays, setNumberOfDays] = React.useState(0);
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<keyof typeof PROMOTION_LOCATIONS | null>(null);
  
  const pathname = usePathname();
  const segments = pathname.split('/');
  const promotionId = segments[4];
  const isEdit = segments.length === 5 && segments[3] === 'update';
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      location: undefined,
      startDate: new Date(),
      endDate: new Date(),
      image: undefined
    }
  });

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded");
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  

  // Calculate pricing when location or dates change
  React.useEffect(() => {
    const calculateAmount = () => {
      const location = form.getValues('location');
      const startDate = form.getValues('startDate');
      const endDate = form.getValues('endDate');

      if (location && startDate && endDate && LOCATION_PRICING[location]) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const amount = days * LOCATION_PRICING[location];
        setNumberOfDays(days);
        setTotalAmount(amount);
      } else {
        setTotalAmount(0);
        setNumberOfDays(0);
      }
    };

    const subscription = form.watch((value, { name }) => {
      if (name === 'location' || name === 'startDate' || name === 'endDate') {
        calculateAmount();
      }
      if (name === 'location') {
        setSelectedLocation(value.location as keyof typeof PROMOTION_LOCATIONS);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const { isLoading } = useQuery({
    queryKey: ['promotion', promotionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/promotion/${promotionId}`);
      return response.data;
    },
    enabled: isEdit,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/promotion/${promotionId}`
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
      setPaymentProcessing(false);
    }
  });

  const getImageDimensions = () => {
    if (!selectedLocation || !PROMOTION_LOCATIONS[selectedLocation]) {
      return { width: 300, height: 250 }; // Default dimensions
    }
    return {
      width: PROMOTION_LOCATIONS[selectedLocation].width,
      height: PROMOTION_LOCATIONS[selectedLocation].height
    };
  };

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      // Get form values directly from React Hook Form
      const values = form.getValues();
      
      // Create FormData with all form values
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('location', values.location);
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      
      formData.append('startDate', startDate.toISOString());
      formData.append('endDate', endDate.toISOString());
      
      // Correctly append the image if it exists
      if (values.image instanceof File) {
        formData.append('image', values.image);
      }

      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Eduroutez",
        description: "Payment for Ad Promotion",
        handler: async (response: any) => {
          if (response.error) {
            toast.error(`Payment failed: ${response.error.description}`);
            setPaymentProcessing(false);
            return;
          }

          try {
            // Add payment details to formData
            formData.append("amount", totalAmount.toString());
            formData.append("paymentId", response.razorpay_payment_id);

            // Send the complete formData to your backend
            const result = await axiosInstance.post(`${apiUrl}/promotion`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            if (result.data) {
              toast.success("Promotion created successfully! 🎉");
              router.push('/dashboard/promotion');
            }
          } catch (error: any) {
            console.error("Error processing promotion:", error);
            toast.error("Failed to create promotion");
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9876543210",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error("Failed to initialize payment");
      setPaymentProcessing(false);
    }
  };
  
  
  
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new window.Image();
      img.onload = () => {
        const location = form.getValues('location');
        if (location && PROMOTION_LOCATIONS[location]) {
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

  const onSubmit = async (values: FormValues) => {
    setPaymentProcessing(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('location', values.location);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('endDate', values.endDate.toISOString());
    console.log('values',values)
    if (values.image) {
      formData.append('image', values.image);
    }
    
    if (isEdit) {
      await mutate(formData);
    } else {
      await handlePayment(formData);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
            </h1>
            <p className="mt-2 text-gray-600">
              Configure your promotion details and complete payment to publish
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-8">
            {/* Pricing Information */}
            {!isEdit && selectedLocation && (
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">Pricing Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Daily Rate:</p>
                    <p className="font-semibold">₹{LOCATION_PRICING[selectedLocation]} per day</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration:</p>
                    <p className="font-semibold">{numberOfDays} days</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="text-xl font-bold text-blue-600">₹{totalAmount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Your existing form fields */}
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
                          {location.label} - ₹{LOCATION_PRICING[location.id]}/day
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {form.formState.errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.location.message}
                  </p>
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
                      width={getImageDimensions().width}
                      height={getImageDimensions().height}
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
                      width: selectedLocation && PROMOTION_LOCATIONS[selectedLocation] ? 
                        `${PROMOTION_LOCATIONS[selectedLocation].width}px` : 
                        '100%',
                      height: selectedLocation && PROMOTION_LOCATIONS[selectedLocation] ? 
                        `${PROMOTION_LOCATIONS[selectedLocation].height}px` : 
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
                  <input
                    type="date"
                    {...form.register('startDate')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...form.register('endDate')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Submit Button (continued) */}
              <button
                type="submit"
                disabled={isPending || paymentProcessing}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || paymentProcessing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-spin">⌛</span>
                    <span>{isEdit ? 'Updating...' : 'Processing Payment...'}</span>
                  </span>
                ) : (
                  <span>{isEdit ? 'Update Promotion' : `Proceed to Pay ₹${totalAmount}`}</span>
                )}
              </button>

              {/* Payment Terms */}
              {!isEdit && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>By proceeding, you agree to our payment terms and conditions:</p>
                  <ul className="list-disc ml-5 mt-2">
                    <li>Payments are processed securely through Razorpay</li>
                    <li>Promotions will be activated after successful payment</li>
                    <li>Refunds are subject to our cancellation policy</li>
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


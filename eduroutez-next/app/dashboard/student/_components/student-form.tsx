'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CalendarIcon, Plus, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  // price: z.string().min(1, {
  //   message: 'Discount is required.'
  // }),
  price: z.string().refine(
    (value) => {
      const price = Number(value);
      return !isNaN(price) && price >= 1 && price <= 100;
    },
    {
      message: 'Discount must be a number between 1 and 100.'
    }
  ),
  startDate: z.date({
    required_error: 'Please select a start date.'
  }),
  endDate: z.date({
    required_error: 'Please select a end date.'
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

  description: z.string().min(20, {
    message: 'description must be at least 20 characters.'
  })
});
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
export default function CounselorForm() {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      // mode: undefined,
      counselorType: ''
    }
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission here
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('startDate', values.startDate.toISOString());
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('mode', 'ONLINE');
    formData.append('counselorType', values.counselorType ?? '');
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/counselor/${segments[4]}`
        : `${apiUrl}/counselor`;
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
        ? 'Counselor updated successfully'
        : 'Counselor created successfully';
      toast.success(message);
      form.reset();
      setPreviewUrl(null);
      router.push('/dashboard/counselor');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // write code to get categories from serve by tanstack query
  const {
    data: categories,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/categories`);
      return response.data;
    }
  });

  const { data: counselor } = useQuery({
    queryKey: ['counselor', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/counselor/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (counselor?.data) {
      form.reset({
        name: counselor.data.name,
        price: counselor.data.price.toString(),
        startDate: new Date(counselor.data.startDate),
        endDate: new Date(counselor.data.endDate),
        category: counselor.data.category[0],
        description: counselor.data.description,
        //  image: undefined // Handle image separately
        counselorType: counselor?.data?.counselorType
      });

      // Set preview URL for existing image
      if (counselor.data.image) {
        setPreviewUrl(`${IMAGE_URL}/${counselor.data.image}`);
      }
    }
  }, [counselor, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Counselor Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counselor Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your counselor name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your counselor price"
                        {...field}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="counselorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counselor Type (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a counselor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'DEFAULT'}>Default</SelectItem>
                        <SelectItem value={'POPULAR'}>Popular</SelectItem>
                        <SelectItem value={'TRENDING'}>Trending</SelectItem>
                      </SelectContent>
                    </Select>
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

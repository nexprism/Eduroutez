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
  streamType: z.string().optional(),

  description: z.string().min(20, {
    message: 'description must be at least 20 characters.'
  })
});
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
export default function StreamForm() {
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
      streamType: ''
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
    formData.append('streamType', values.streamType ?? '');
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/stream/${segments[4]}`
        : `${apiUrl}/stream`;
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
        ? 'Stream updated successfully'
        : 'Stream created successfully';
      toast.success(message);
      form.reset();
      setPreviewUrl(null);
      router.push('/dashboard/stream');
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

  const { data: stream } = useQuery({
    queryKey: ['stream', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/stream/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (stream?.data) {
      form.reset({
        name: stream.data.name,
        price: stream.data.price?.toString(),
        startDate: new Date(stream.data.startDate),
        endDate: new Date(stream.data.endDate),
        category: stream.data.category[0],
        description: stream.data.description,
        //  image: undefined // Handle image separately
        streamType: stream?.data?.streamType
      });

      // Set preview URL for existing image
      if (stream.data.image) {
        setPreviewUrl(`${IMAGE_URL}/${stream.data.image}`);
      }
    }
  }, [stream, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Stream Information
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
                    <FormLabel>Stream Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your stream name"
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
                        placeholder="Enter your stream price"
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
                name="streamType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Type (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stream type" />
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
              <FormField
                control={form.control}
                name="streamType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stream type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'Active'}>Active</SelectItem>
                        <SelectItem value={'Inactive'}>Inactive</SelectItem>
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

'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
  price: z.string(),
  features: z
    .array(
      z.object({
        key: z.string().min(1, { message: 'Key is required.' }),
        value: z.string().min(1, { message: 'Value is required.' })
      })
    )
    .min(1, { message: 'At least one feature is required.' }),

  subscriptionType: z.string().optional(),
  status: z.string().optional(),
  description: z.string(),
  duration: z.string(),
  durationType: z.string()
});

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const durationType = [
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
export default function SubscriptionForm() {
  // const [cnt, setcnt] = React.useState(1);
  // const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  console.log(pathname);
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
      price: '',
      features: [{ key: '', value: '' }],
      subscriptionType: '',
      status: '',
      duration:'',
      durationType: '',
      description: ''
    }
  });

  const {
    control,
    formState: { errors }
  } = form;

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'features'
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('hi');
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('duration', values.duration.toString());
    formData.append('durationType', values.durationType);
    formData.append('status', values.status ?? '');
    formData.append('description', values.description);
    formData.append('subscriptionType', values.subscriptionType ?? '');

    // Add features dynamically
    values.features?.forEach((feature, index) => {
      formData.append(`features[${index}][key]`, feature.key);
      formData.append(`features[${index}][value]`, feature.value);
    });

    console.log(formData);
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/subscription/${segments[4]}`
        : `${apiUrl}/subscription`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: isEdit ? 'patch' : 'post',
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = isEdit
        ? 'Subscription updated successfully'
        : 'Subscription created successfully';
      toast.success(message);
      form.reset();
      router.push('/dashboard/subscription');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // write code to get categories from serve by tanstack query
  const {
    data: categories,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: ['subcriptions'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/subscriptions`);
      return response.data;
    }
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/subscription/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (subscription?.data) {
      form.reset({
        name: subscription.data.name,
        price: subscription.data.price.toString(),
        duration: subscription.data.duration.toString(),
        durationType: subscription.data.durationType,
        // category: subscription.data.category[0],
        description: subscription.data.description,
        //  image: undefined // Handle image separately
        subscriptionType: subscription?.data?.subscriptionType
      });
      subscription.data.features.forEach(
        (feature: { key: string; value: string }) => {
          append({ key: feature.key, value: feature.value });
        }
      );
    }
  }, [subscription, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Subscription Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              if (Object.keys(errors).length > 0) {
                console.log('hi2');
                console.log(errors);
                console.log(form);
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your subscription name"
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
                        placeholder="Enter your subscription price"
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
                name="subscriptionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Type (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subscription type" />
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
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
                name="durationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationType.map((status) => (
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Duration"
                        {...field}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
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
            <div>
              <FormLabel className="top-2">Features</FormLabel>
              <Button
                type="button"
                className="ml-2"
                onClick={() => append({ key: '', value: '' })}
              >
                +
              </Button>
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Key"
                      {...form.register(`features.${index}.key`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Value"
                      {...form.register(`features.${index}.value`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <Button
                  type="button"
                  className="w-2"
                  onClick={() => remove(index)}
                >
                  -
                </Button>
              </div>
            ))}

            {/* {Array.from({ length: cnt }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Key"
                      {...form.register(`features.${index}.key`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Value"
                      {...form.register(`features.${index}.value`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <Button
                  type="button"
                  className="w-2"
                  onClick={() => setcnt(cnt - 1)}
                >
                  -
                </Button>
              </div>
            ))} */}

            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

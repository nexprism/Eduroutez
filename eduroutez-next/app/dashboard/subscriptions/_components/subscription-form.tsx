'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
import CustomEditor from '@/components/custom-editor';
import { X, Loader2 } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
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

const subscriptionTypes = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'POPULAR', label: 'Popular' },
  { value: 'TRENDING', label: 'Trending' }
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SubscriptionForm() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const subscriptionId = segments[3]; // Get the ID from URL (fixed index)

  // Debug logging
  React.useEffect(() => {
    console.log('Pathname:', pathname);
    console.log('Segments:', segments);
  }, [pathname, segments]);

  React.useEffect(() => {
    // Fixed condition to check for edit mode
    if (segments.length === 5 && segments[4] === 'edit') {
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
      duration: '',
      durationType: '',
      description: ''
    }
  });

  const { control, reset, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features'
  });

  const { data: subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: async () => {
      console.log('Fetching subscription data for ID:', subscriptionId);
      const response = await axiosInstance.get(
        `${apiUrl}/subscription/${subscriptionId}`
      );
      console.log('Subscription data:', response.data);
      return response.data;
    },
    enabled: isEdit && !!subscriptionId,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    }
  });

  // Set form values when subscription data is available
  React.useEffect(() => {
    if (subscription?.data && isEdit) {
      console.log('Setting form data with:', subscription.data);
      
      // Clear existing features first to avoid duplicates
      remove();
      
      // Reset form with subscription data
      reset({
        name: subscription.data.name || '',
        price: subscription.data.price ? subscription.data.price.toString() : '',
        duration: subscription.data.duration ? subscription.data.duration.toString() : '',
        durationType: subscription.data.durationType || '',
        status: subscription.data.status || '',
        description: subscription.data.description || '',
        subscriptionType: subscription.data.subscriptionType || '',
        features: [] // We'll add these below
      });

      // Force update select fields to ensure they display correctly
      if (subscription.data.durationType) {
        setValue('durationType', subscription.data.durationType);
      }
      
      if (subscription.data.status) {
        setValue('status', subscription.data.status);
      }
      
      if (subscription.data.subscriptionType) {
        setValue('subscriptionType', subscription.data.subscriptionType);
      }
      
      // Add features separately
      if (subscription.data.features && Array.isArray(subscription.data.features)) {
        subscription.data.features.forEach((feature: { key: string; value: string }) => {
          append({ key: feature.key, value: feature.value });
        });
      } else {
        // Ensure at least one empty feature field
        append({ key: '', value: '' });
      }
    }
  }, [subscription, reset, isEdit, remove, append, setValue]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting form:', values);
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

    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/subscription/${subscriptionId}`
        : `${apiUrl}/subscription`;
      
      console.log(`Making ${isEdit ? 'PATCH' : 'POST'} request to ${endpoint}`);
      
      const response = await axiosInstance({
        url: endpoint,
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
      router.push('/dashboard/subscriptions');
    },
    onError: (error) => {
      toast.error('Something went wrong');
      console.error('Submission error:', error);
    }
  });

  // Get current form values for debugging
  const watchAllFields = form.watch();
  React.useEffect(() => {
    console.log('Current form values:', watchAllFields);
  }, [watchAllFields]);

  if (subscriptionError) {
    return (
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Error Loading Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-destructive">
            Failed to load subscription data. Please try again or contact support.
          </div>
          <Button onClick={() => router.push('/dashboard/subscriptions')}>
            Back to Subscriptions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Update Subscription' : 'Create Subscription'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingSubscription && isEdit ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            Loading subscription data...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                if (Object.keys(errors).length > 0) {
                  console.log('Form validation errors:', errors);
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
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subscription type">
                              {field.value ? subscriptionTypes.find(type => type.value === field.value)?.label : "Select a subscription type"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subscriptionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status">
                              {field.value ? statuses.find(status => status.value === field.value)?.label : "Select Status"}
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
                  name="durationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type">
                              {field.value ? durationType.find(type => type.value === field.value)?.label : "Select Type"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationType.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
              <div className="flex items-center gap-2">
                <FormLabel>Features</FormLabel>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ key: '', value: '' })}
                >
                  Add Feature
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center"
                >
                 <FormField
                    control={form.control}
                    name={`features.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter Key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter Value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1} // Prevent removing the last feature
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isEdit ? (
                  'Update'
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
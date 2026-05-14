'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters').max(100),
  webinarCount: z.coerce.number().min(1).max(1000),
  originalPrice: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().min(0),
  description: z.string().max(500).optional(),
  features: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string()
});

type FormValues = z.infer<typeof formSchema>;

interface WebinarPackageFormProps {
  packageId?: string;
  initialData?: any;
  isEdit?: boolean;
}

export default function WebinarPackageForm({
  packageId,
  initialData,
  isEdit = false
}: WebinarPackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      webinarCount: initialData?.webinarCount || 1,
      originalPrice: initialData?.originalPrice || 0,
      discountPrice: initialData?.discountPrice || 0,
      salePrice: initialData?.salePrice || 0,
      description: initialData?.description || '',
      features: initialData?.features || [],
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        features
      };

      if (isEdit && packageId) {
        await axiosInstance.patch(`/webinar-package/${packageId}`, payload);
      } else {
        await axiosInstance.post('/webinar-package', payload);
      }

      router.push('/dashboard/webinar-package');
      router.refresh();
    } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          {isEdit ? 'Edit Package' : 'Create Webinar Package'}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {isEdit ? 'Update package details' : 'Create a new webinar package for sale'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>Enter the details for your webinar package</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Premium Package' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='webinarCount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Webinars</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='50' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe what this package includes'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing */}
              <div className='space-y-4'>
                <h3 className='font-semibold'>Pricing</h3>
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='originalPrice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (₹)</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='10000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='discountPrice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price (₹)</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='8000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='salePrice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (₹)</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='7500' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sale Period */}
              <div className='space-y-4'>
                <h3 className='font-semibold'>Sale Period</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Features */}
              <div className='space-y-4'>
                <h3 className='font-semibold'>Features</h3>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Add a feature (e.g., Live Webinar Access)'
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addFeature}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
                {features.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {features.map((feature, index) => (
                      <Badge key={index} variant='secondary' className='flex items-center gap-2'>
                        {feature}
                        <X
                          className='h-3 w-3 cursor-pointer'
                          onClick={() => removeFeature(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className='flex gap-4'>
                <Button
                  type='submit'
                  disabled={loading}
                  className='gap-2'
                >
                  {loading && <Loader className='h-4 w-4 animate-spin' />}
                  {isEdit ? 'Update Package' : 'Create Package'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import axiosInstance from '@/lib/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const organisationOptions = [
  { value: 'Institute', label: 'Institute' },
  { value: 'University', label: 'University' },
  { value: 'College', label: 'College' }
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  phone: z
    .string({
      required_error: 'Please enter a phone number.'
    })
    .regex(/^[6-9]\d{9}$/, {
      message: 'Please enter a valid Indian mobile number.'
    }),
  email: z
    .string({
      required_error: 'Please enter an email.'
    })
    .email({
      message: 'Please enter a valid email address.'
    }),
  organization: z.string({
    required_error: 'Please select organization.'
  }),
  password: z
    .string({
      required_error: 'Please enter a password.'
    })
    .min(8, {
      message: 'Password must be at least 8 characters long.'
    })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).*$/,
      'Password must contain an uppercase letter, a lowercase letter, and a number or special character.'
    ),
  isBestRatedUniversity: z.boolean().optional(),
  isBestRatedCollege: z.boolean().optional(),

});

export default function InstituteCreateForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      phone: '',
      email: '',
      organization: '',
      password: '',
      isBestRatedUniversity: false,
      isBestRatedCollege: false,

    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const instituteData = {
      instituteName: values.title,
      institutePhone: values.phone,
      email: values.email,
      password: values.password,
      organization: values.organization,
      isBestRatedUniversity: values.isBestRatedUniversity,
      isBestRatedCollege: values.isBestRatedCollege,

    };
    mutate(instituteData);
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (jsonData: {
      instituteName: string;
      institutePhone: string;
      email: string;
      password: string;
    }) => {
      const endpoint = `${apiUrl}/institute`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: 'post',
        data: jsonData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = 'Institute created successfully';
      toast.success(message);
      form.reset();
      router.push('/dashboard/institute');
    },
    onError: (error) => {
      // Try to show specific error message from API response
      const apiError = error?.response?.data?.error || error?.message || 'Something went wrong';
      toast.error(apiError);
    }
  });


  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            Institute Information
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
                    <FormLabel>Institute Name</FormLabel>
                    <FormControl>
                      <Input placeholder="enter institute name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter email"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter phone number"
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
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organisationOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Best Rated Checkbox - show only for selected organization */}
              {form.watch('organization') === 'Institute' && (
                <FormField
                  control={form.control}
                  name="isBestRatedInstitute"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={e => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="mb-0">Best Rated Institute</FormLabel>
                    </FormItem>
                  )}
                />
              )}
              {form.watch('organization') === 'University' && (
                <FormField
                  control={form.control}
                  name="isBestRatedUniversity"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={e => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="mb-0">Best Rated University</FormLabel>
                    </FormItem>
                  )}
                />
              )}
              {form.watch('organization') === 'College' && (
                <FormField
                  control={form.control}
                  name="isBestRatedCollege"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={e => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="mb-0">Best Rated College</FormLabel>
                    </FormItem>
                  )}
                />
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

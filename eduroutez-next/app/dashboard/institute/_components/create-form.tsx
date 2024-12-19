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
import axiosInstance from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
  about: z.any().optional(),
  admissionInfo: z.string().optional(),
  placementInfo: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  website: z.string().url().optional(),
  establishedYear: z.any().optional(),
  email: z
    .string({
      required_error: 'Please enter an email.'
    })
    .email({
      message: 'Please enter a valid email address.'
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
    )
});

export default function InstituteCreateForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      phone: '',
      about: '',
      admissionInfo: '',
      placementInfo: '',
      state: '',
      city: '',
      website: '',
      establishedYear: '',
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const instituteData = {
      instituteName: values.title,
      about:values.about,
      admissionInfo:values.admissionInfo,
      placementInfo:values.placementInfo,
      state:values.state,
      city:values.city,
      website:values.website,
      establishedYear:values.establishedYear,
      institutePhone: values.phone,
      email: values.email,
      password: values.password
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
      toast.error('Something went wrong');
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
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Controller
                        name="about"
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
                name="admissionInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Procedure</FormLabel>
                    <FormControl>
                      <Controller
                        name="admissionInfo"
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
                name="placementInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placements Procedure</FormLabel>
                    <FormControl>
                      <Controller
                        name="placementInfo"
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
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter email"
                        {...field}
                        type="string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter email"
                        {...field}
                        type="string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter email"
                        {...field}
                        type="string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="establishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Year</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter email"
                        {...field}
                        type="string"
                      />
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

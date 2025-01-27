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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const formSchema = z.object({
  firstname: z.string().min(2, {
    message: 'First name must be at least 2 characters.'
  }),
  lastname: z.string().min(2, {
    message: 'Last name must be at least 2 characters.'
  }),
  contactno: z.string().min(10, {
    message: 'Contact number must be at least 10 characters.'
  }),
  email: z.string().email({
    message: 'Invalid email address.'
  }),
  instituteId: z.string().min(1, {
    message: 'Institute ID is required.'
  })
});

export default function CounselorForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const counselorId = segments[4];

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      contactno: '',
      email: '',
      instituteId: ''
    }
  });
  const router = useRouter();

  // Add query to fetch counselor data
  const { data: counselorData, isLoading } = useQuery({
    queryKey: ['counselor', counselorId],
    queryFn: async () => {
      if (isEdit && counselorId) {
        const response = await axiosInstance.get(`${apiUrl}/counselor/${counselorId}`);
        return response.data;
      }
      return null;
    },
    enabled: isEdit && !!counselorId
  });

  // Set initial form values when counselor data is fetched
  React.useEffect(() => {
    if (counselorData) {
      form.reset({
        firstname: counselorData.firstname,
        lastname: counselorData.lastname,
        contactno: counselorData.contactno,
        email: counselorData.email,
        instituteId: counselorData.instituteId
      });
    }
  }, [counselorData, form]);

  // Set instituteId from localStorage
  React.useEffect(() => {
    const instituteId = localStorage.getItem('instituteId');
    if (instituteId) {
      form.setValue('instituteId', instituteId);
    }
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('firstname', values.firstname);
    formData.append('lastname', values.lastname);
    formData.append('contactno', values.contactno);
    formData.append('email', values.email);
    formData.append('instituteId', values.instituteId);
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/counselor/${counselorId}`
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
      router.push('/dashboard/counselor');
    },
    onError: (error) => {
      toast.error((error as any)?.response?.data?.error || 'An error occurred');
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Update Counselor' : 'Add New Counselor'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your contact number"
                        {...field}
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
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
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
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Dynamic schema based on edit mode
const getFormSchema = (isEdit: boolean) => {
  const baseSchema = {
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
    category: z.string().min(1, {
      message: 'Category is required.'
    }),
    instituteId: z.string().min(1, {
      message: 'Institute ID is required.'
    })
  };

  // Add password field only for create mode
  if (!isEdit) {
    return z.object({
      ...baseSchema,
      password: z.string().min(8, {
        message: 'Password must be at least 8 characters.'
      })
    });
  }

  return z.object(baseSchema);
};

export default function CounselorForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const counselorId = segments[4];
  const [selectedCategoryName, setSelectedCategoryName] = React.useState<string>('');

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(isEdit)),
    defaultValues: {
      firstname: '',
      lastname: '',
      contactno: '',
      email: '',
      ...(isEdit ? {} : { password: '' }),
      category: '',
      instituteId: ''
    }
  });
  const router = useRouter();

  // Fetch categories/streams
  const { data: categories } = useQuery({
    queryKey: ['streams', 0], // Added page to queryKey
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/streams`, {
          params: {
            page: 0
          }
        });
        return response.data?.data?.result || [];
      } catch (error) {
        console.error('Error fetching streams:', error);
        return [];
      }
    }
  });

  // Add query to fetch counselor data
  const { data: counselorData, isLoading } = useQuery({
    queryKey: ['counselor', counselorId],
    queryFn: async () => {
      if (isEdit && counselorId) {
        const response = await axiosInstance.get(`${apiUrl}/counselor-by-id/${counselorId}`);
        return response.data.data;
      }
      return null;
    },
    enabled: isEdit && !!counselorId
  });

  // Set initial form values and find category name when counselor data is fetched
  React.useEffect(() => {
    if (counselorData) {
      const formData = {
        firstname: counselorData.firstname || '',
        lastname: counselorData.lastname || '',
        contactno: counselorData.contactno || '',
        email: counselorData.email || '',
        category: counselorData.category || '',
        instituteId: counselorData.instituteId || ''
      };
      form.reset(formData);

      // Find and set the category name
      if (Array.isArray(categories)) {
        const selectedCategory = categories.find(cat => cat?._id === counselorData.category);
        if (selectedCategory?.name) {
          setSelectedCategoryName(selectedCategory.name);
        }
      }
    }
  }, [counselorData, categories, form]);

  // Set instituteId from localStorage
  React.useEffect(() => {
    const instituteId = localStorage.getItem('instituteId');
    if (instituteId) {
      form.setValue('instituteId', instituteId);
    }
  }, [form]);

  function onSubmit(values: z.infer<ReturnType<typeof getFormSchema>>) {
    const formData = new FormData();
    formData.append('firstname', values.firstname);
    formData.append('lastname', values.lastname);
    formData.append('contactno', values.contactno);
    formData.append('email', values.email);
    if (!isEdit) {
      formData.append('password', values.password);
    }
    formData.append('category', values.category);
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
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedCategory = categories?.find((cat: { name: string }) => cat?.name === value);
                        if (selectedCategory?.name) {
                          setSelectedCategoryName(selectedCategory.name);
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category">
                            {field.value ? selectedCategoryName : 'Select a category'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category: any) => (
                          <SelectItem 
                            key={category?.name || 'default'} 
                            value={category?.name || ''}
                          >
                            {category?.name || 'Unnamed Category'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
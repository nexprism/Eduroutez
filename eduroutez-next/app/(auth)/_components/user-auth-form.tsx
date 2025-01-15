'use client';
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
import axiosInstance from '@/lib/axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm({ setToggle, toggle }: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [user, setuser] = useState();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'superadmin@gmail.com',
      password: '465@$ddhg%$%$vfDFC53'
    }
  });

  // Mutation for login
  const mutation: any = useMutation({
    mutationFn: async (credentials: UserFormValue) => {
      try {
        const response = await axiosInstance.post(
          `${apiUrl}/login`,
          credentials,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error: any) {
        // Handle error based on axios structure
        const errorMessage = error.response?.data?.message || 'Failed to login';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      console.log(data?.data?.user)
      setuser(data?.data?.user);
      console.log(user);
      toast.success('Signed In Successfully!');
      localStorage.setItem(
        'accessToken',
        JSON.stringify(data.data.accessToken)
      );
      localStorage.setItem(
        'instituteId',
        data?.data?.user?._id
      );
      localStorage.setItem(
        'role',
        data?.data?.user?.role
      );
      localStorage.setItem(
        'email',
        data?.data?.user?.email
      );      
      localStorage.setItem(
        'refreshToken',
        JSON.stringify(data.data.refreshToken)
      );

      // Redirect to dashboard
      startTransition(() => {
        router.push('/dashboard/overview');
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to login');
    }
  });

  // Form submit handler
  const onSubmit = (data: UserFormValue) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  disabled={mutation.isLoading || isPending}
                  {...field}
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
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={mutation.isLoading || isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button className='w-full justify-end text-blue-600 ml-0' onClick={() => setToggle(!toggle)} type="button">Don't Have Account?Create Account</button>
        <Button
          disabled={mutation.isLoading || isPending}
          type="submit"
        >
          {mutation.isLoading || isPending ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}

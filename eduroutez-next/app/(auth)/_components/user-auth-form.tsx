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
import { emailField } from '@/lib/validations';

const hasEmoji = (val: string) => /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u.test(val);

const formSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((val) => !hasEmoji(val), { message: 'Password cannot contain emojis' })
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
      email: '',
      password: ''
    }
  });

  // Mutation for login
  const mutation: any = useMutation({
    mutationFn: async (credentials: UserFormValue) => {
      try {
        const response = await axiosInstance.post(
          `${apiUrl}/login`,
          { ...credentials, isStudent: false },
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
      const returnedRole = String(data?.data?.user?.role || '').toLowerCase();
      if (returnedRole === 'student' || returnedRole === 'user') {
        toast.error('Login not allowed for student or user roles.');
        return;
      }
      setuser(data?.data?.user);
      console.log(user);
      toast.success('Signed In Successfully!');
      localStorage.setItem(
        'accessToken',
        JSON.stringify(data.data.accessToken)
      );
      localStorage.setItem(
        'instituteId',
        data?.data?.user?.instituteId || data?.data?.user?._id
      );
      localStorage.setItem('role', String(data?.data?.user?.role || ''));
      localStorage.setItem('subRole', String(data?.data?.user?.subRole || ''));
      localStorage.setItem('email', String(data?.data?.user?.email || ''));
      localStorage.setItem(
        'refreshToken',
        JSON.stringify(data.data.refreshToken)
      );
      
      // Store test schedule details if available
      if (data?.data?.user?.scheduledTestDate) {
        localStorage.setItem('scheduledTestDate', String(data.data.user.scheduledTestDate));
      }
      if (data?.data?.user?.scheduledTestSlot) {
        localStorage.setItem('scheduledTestSlot', String(data.data.user.scheduledTestSlot));
      }
      
      // Notify other components (like the timer) to re-read localStorage
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('counselor-test-update'));
      }

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
        <button className='w-full justify-end text-blue-600 ml-0' onClick={() => setToggle(!toggle)} type="button">Don&apos;t Have Account?Create Account</button>
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

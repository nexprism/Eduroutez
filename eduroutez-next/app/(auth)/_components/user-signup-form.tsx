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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string(),
  contact_number: z.string(),
  role: z.string(),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
});

const roleTypes = [
  { value: 'admin', label: 'Admin' },
  // { value: 'student', label: 'Student' },
  { value: 'institute', label: 'University/College Institute' },
  { value: 'counsellor', label: 'Counsellor' }
];

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignupForm({ setToggle ,toggle}: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      role: '',
      email: '',
      password: ''
    }
  });

  // Mutation for login
  const mutation: any = useMutation({
    mutationFn: async (credentials: UserFormValue) => {
      try {
        const response = await axiosInstance.post(
          `${apiUrl}/signup`,
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
      toast.success('Signed In Successfully!');
      localStorage.setItem(
        'accessToken',
        JSON.stringify(data.data.accessToken)
      );
      localStorage.setItem(
        'refreshToken',
        JSON.stringify(data.data.refreshToken)
      );

      // Redirect to dashboard
      startTransition(() => {
        router.push('/');
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to login');
    }
  });

  // Form submit handler
  const onSubmit = (data: UserFormValue) => {
    if(data?.password===data?.confirmPassword){
        mutation.mutate(data);
        alert(
          'Your Request was sent to Admin!! You can Login when admin allow you'
        );
        setToggle(!toggle);
        alert('Login to continue');
    }else{
        alert('Mismatched Password');
    }
  };

  const handleToggle = () => {
    setToggle(false);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="string"
                  placeholder="Enter your name"
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
          name="contact_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone No</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your Contact number"
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleTypes.map((type) => (
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
        <button className='w-full justify-end text-blue-600 ml-0' onClick={()=>setToggle(!toggle)} type='button'>Already have account? Sign In</button>
        <Button
          disabled={mutation.isLoading || isPending}
          className="ml-auto w-full"
          type="submit"
        >
          {mutation.isLoading || isPending ? 'Signing In...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}

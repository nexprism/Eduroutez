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
import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'; // Ensure this component is correctly imported

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  contact_number: z
    .string()
    .regex(/^\d+$/, { message: 'Enter a valid phone number' })
    .nonempty({ message: 'Contact number is required' }),
  role: z.string().nonempty({ message: 'Role is required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  is_verified: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const roleTypes = [
  { value: 'institute', label: 'University/College Institute' },
  { value: 'counsellor', label: 'Counsellor' }
];

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignupForm({ setToggle, toggle }: { setToggle: (value: boolean) => void; toggle: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [role, setRole] = useState<string>('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: '',
      is_verified: false
    }
  });

  const mutation = useMutation({
    mutationFn: async (credentials: UserFormValue) => {
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
    },
    onSuccess: (data) => {
      toast.success('Signed Up Successfully!');
      if (role === 'institute') {
        setShowAlert(true);
      }
      localStorage.setItem('accessToken', JSON.stringify(data.data.accessToken));
      localStorage.setItem('refreshToken', JSON.stringify(data.data.refreshToken));
      router.push('/');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to sign up';
      toast.error(errorMessage);
    }
  });

  const onSubmit = (data: UserFormValue) => {
    if (data.role === 'counsellor') {
      data.is_verified = true;
    }
    mutation.mutate(data);
  };

  const SignupAlert = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-2 border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-red-500">
            Request Submitted Successfully
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 text-lg">
            Your request has been sent to the admin. You will be able to log in once your account is approved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg"
            onClick={() => {
              onClose();
              setToggle(!toggle);
            }}
          >
            Continue to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const isLoading = mutation.status === 'pending';

  // Update role dynamically
  useEffect(() => {
    if (form.watch('role')) {
      setRole(form.watch('role'));
    }
  }, [form.watch('role')]);

  const roleSpecificLabel = role === 'institute'
    ? 'Institute Name'
    : role === 'counsellor'
    ? 'Counsellor Name'
    : 'Name';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{roleSpecificLabel}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={`Enter your ${roleSpecificLabel.toLowerCase()}`}
                  disabled={isLoading}
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
                  type="text"
                  placeholder="Enter your Contact number"
                  disabled={isPending}
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
                  disabled={isPending}
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
                  disabled={isPending}
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
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button className='w-full justify-end text-blue-600 ml-0' onClick={() => setToggle(!toggle)} type='button'>Already have an account? Sign In</button>
        <Button
          disabled={isPending}
          className="ml-auto w-full"
          type="submit"
        >
          {isPending ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
      <SignupAlert isOpen={showAlert} onClose={() => setShowAlert(false)} />
    </Form>
  );
}

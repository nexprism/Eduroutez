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
import { useTransition, useState, useEffect, useRef, useMemo } from 'react';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  contact_number: z
    .string()
    .regex(/^\d+$/, { message: 'Enter a valid phone number' })
    .min(1, { message: 'Contact number is required' }),
  role: z.string().min(1, { message: 'Role is required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).*$/,
      'Password must contain an uppercase letter, a lowercase letter, and a number or special character.'
    ),
  confirmPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  is_verified: z.boolean().optional(),
  otp: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const roleTypes = [
  { value: 'institute', label: 'University/College/Institute' },
  { value: 'counsellor', label: 'Counsellor' }
];

type UserFormValue = z.infer<typeof formSchema>;

interface OTPInputProps {
  otp: string;
  setOtp: (value: string) => void;
  maxLength?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ setOtp, maxLength = 6 }) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(maxLength).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const combinedOtp = otpValues.join('');
    setOtp(combinedOtp);
  }, [otpValues, setOtp]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/[^\d]/g, '').split('').slice(0, maxLength);

    const newOtpValues = [...otpValues];
    pastedNumbers.forEach((value, index) => {
      if (index < maxLength) {
        newOtpValues[index] = value;
      }
    });
    setOtpValues(newOtpValues);

    const nextEmptyIndex = newOtpValues.findIndex(value => !value);
    const focusIndex = nextEmptyIndex === -1 ? maxLength - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {otpValues.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={value}
          ref={el => inputRefs.current[index] = el}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default function UserSignupForm({ setToggle, toggle }: { setToggle: (value: boolean) => void; toggle: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState<UserFormValue | null>(null);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: '',
      is_verified: false,
      otp: ''
    }
  });

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const sendOtpMutation = useMutation({
    mutationFn: async (credentials: { email: string; contact_number: string }) => {
      const response = await axiosInstance.post(
        `${apiUrl}/send-otp`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      if (!showOtpDialog) {
        setShowOtpDialog(true);
        setTimeLeft(90);
        setCanResend(false);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage);
    }
  });

  const signupMutation = useMutation({
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
      if (data.data.user.role === 'counsellor') {
        setShowAlert(false);
        setToggle(!toggle);
        localStorage.setItem('accessToken', JSON.stringify(data.data.accessToken));
        localStorage.setItem('refreshToken', JSON.stringify(data.data.refreshToken));
        startTransition(() => router.push('/'));
      } else {
        setShowAlert(false);
        localStorage.setItem('accessToken', JSON.stringify(data.data.accessToken));
        localStorage.setItem('refreshToken', JSON.stringify(data.data.refreshToken));
        startTransition(() => router.push('/'));
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to sign up';
      toast.error(errorMessage);
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    setFormData(data); // Store form data
    await sendOtpMutation.mutateAsync({
      email: data.email,
      contact_number: data.contact_number
    });
  };

  const handleResendOtp = async () => {
    if (formData) {
      await sendOtpMutation.mutateAsync({
        email: formData.email,
        contact_number: formData.contact_number
      });
    }
  };

  const verifyAndSignup = () => {
    if (formData) {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.role === 'counsellor') {
        dataToSubmit.is_verified = true;
      }
      dataToSubmit.otp = otp;
      signupMutation.mutate(dataToSubmit);
      setShowOtpDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const OtpDialog = useMemo(() => (
    <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
      <DialogContent className="sm:max-w-md" aria-describedby="otp-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-center">Enter Verification Code</DialogTitle>
          <div id="otp-dialog-description" className="text-center text-sm text-gray-500 mt-2">
            We have sent a verification code to your email and phone number
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <OTPInput otp={otp} setOtp={setOtp} maxLength={6} />
          <div className="text-center text-sm">
            {!canResend ? (
              <p className="text-gray-500">
                Resend code in <span className="font-medium">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={!canResend || sendOtpMutation.isPending}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
              >
                Resend Code
              </button>
            )}
          </div>
          <Button
            onClick={verifyAndSignup}
            className="w-full"
            disabled={otp.length !== 6 || signupMutation.isPending}
          >
            {signupMutation.isPending ? 'Verifying...' : 'Verify & Sign Up'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  ), [showOtpDialog, otp, canResend, timeLeft, sendOtpMutation.isPending, signupMutation.isPending]);

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

  const isLoading = signupMutation.status === 'pending' || sendOtpMutation.status === 'pending';

  return (
    <>
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
          <button
            className="w-full justify-end text-blue-600 ml-0"
            onClick={() => setToggle(!toggle)}
            type="button"
          >
            Already have an account? Sign In
          </button>
          <Button
            disabled={isLoading}
            className="ml-auto w-full"
            type="submit"
          >
            {isLoading ? 'Please wait...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      {OtpDialog}
      <SignupAlert isOpen={showAlert} onClose={() => setShowAlert(false)} />
    </>
  );
}

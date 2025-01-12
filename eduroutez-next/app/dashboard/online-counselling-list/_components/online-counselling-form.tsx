'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
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
  SelectValue
} from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CalendarIcon, Plus, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import CustomEditor from '@/components/custom-editor';

const formSchema = z.object({
  mondayStart: z.string().nonempty('Monday start time is required'),
  mondayEnd: z.string().nonempty('Monday end time is required'),
  tuesdayStart: z.string().nonempty('Tuesday start time is required'),
  tuesdayEnd: z.string().nonempty('Tuesday end time is required'),
  wednesdayStart: z.string().nonempty('Wednesday start time is required'),
  wednesdayEnd: z.string().nonempty('Wednesday end time is required'),
  thursdayStart: z.string().nonempty('Thursday start time is required'),
  thursdayEnd: z.string().nonempty('Thursday end time is required'),
  fridayStart: z.string().nonempty('Friday start time is required'),
  fridayEnd: z.string().nonempty('Friday end time is required'),
  saturdayStart: z.string().nonempty('Saturday start time is required'),
  saturdayEnd: z.string().nonempty('Saturday end time is required'),
  sundayStart: z.string().nonempty('Sunday start time is required'),
  sundayEnd: z.string().nonempty('Sunday end time is required')
});

export default function CounselorForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mondayStart: '',
      mondayEnd: '',
      tuesdayStart: '',
      tuesdayEnd: '',
      wednesdayStart: '',
      wednesdayEnd: '',
      thursdayStart: '',
      thursdayEnd: '',
      fridayStart: '',
      fridayEnd: '',
      saturdayStart: '',
      saturdayEnd: '',
      sundayStart: '',
      sundayEnd: ''
    }
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle form submission here
    const counselorEmail = localStorage.getItem('email');
    const dataWithCounselorEmail = { ...values, counselorEmail };
    console.log(dataWithCounselorEmail);
    mutate(dataWithCounselorEmail);
    // mutate(values);
  }

  const email = localStorage.getItem('email');
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: z.infer<typeof formSchema>) => {
      const endpoint = isEdit
        ? `${apiUrl}/counselorslots/${email}`
        : `${apiUrl}/counselorslots`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: isEdit ? 'patch' : 'post',
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = isEdit
        ? 'Slot updated successfully'
        : 'Slot created successfully';
      toast.success(message);
      form.reset();
      router.push('/dashboard/online-counselling');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // write code to get categories from serve by tanstack query
  

  const { data: counselorData } = useQuery({
    queryKey: ['counselorData', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/counselorslots/${email}`);
      const data = response.data?.data;
      console.log('hi2',data);
      if (data) {
        setIsEdit(true);
        form.reset({
          mondayStart: data.mondayStart,
          mondayEnd: data.mondayEnd,
          tuesdayStart: data.tuesdayStart,
          tuesdayEnd: data.tuesdayEnd,
          wednesdayStart: data.wednesdayStart,
          wednesdayEnd: data.wednesdayEnd,
          thursdayStart: data.thursdayStart,
          thursdayEnd: data.thursdayEnd,
          fridayStart: data.fridayStart,
          fridayEnd: data.fridayEnd,
          saturdayStart: data.saturdayStart,
          saturdayEnd: data.saturdayEnd,
          sundayStart: data.sundayStart,
          sundayEnd: data.sundayEnd
        });
      }
      return data;
    }
  });

  // React.useEffect(() => {
  //   if (faq?.data) {
  //     form.reset({
  //       question: faq.data.question,
  //       answer: faq.data.answer
  //     });
  //   }
  // }, [faq, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Set Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              if (Object.keys(errors).length > 0) {
                toast.error(
                  'Please correct the errors in the form before submitting.'
                );
              }
            })}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="mondayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mondayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tuesdayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuesday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tuesdayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuesday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="wednesdayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wednesday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wednesdayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wednesday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="thursdayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thursday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thursdayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thursday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fridayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Friday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fridayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Friday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="saturdayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saturday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saturdayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saturday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sundayStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sunday Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sundayEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sunday End Time</FormLabel>
                    <FormControl>
                      <Input className="pr-10" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

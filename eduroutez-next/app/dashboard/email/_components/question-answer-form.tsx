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
  to: z
    .array(z.string().email('Invalid email format'))
    .nonempty('To field is required'),
  subject: z.string().nonempty('Subject is required'),
  message: z.string().nonempty('Message is required')
});

export default function CounselorForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl= process.env.NEXT_PUBLIC_BASE_URL;

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: [],
      subject: '',
      message: ''
    }
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission here
    const formData = {
      to: values.to,
      subject: values.subject,
      message: values.message
    };
    console.log(formData);
    mutate(formData);
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: z.infer<typeof formSchema>) => {
      const endpoint = isEdit
        ? `${apiUrl}/create-email/${segments[4]}`
        : `${apiUrl}/create-email`;
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
        ? 'Template updated successfully'
        : 'Template created successfully';
      toast.success(message);
      form.reset();
      router.push('/dashboard/email');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    }
  });

  
  // write code to get categories from serve by tanstack query

  const { data: email } = useQuery({
    queryKey: ['answer', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/create-email/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (email?.data) {
      form.reset({
        to: email.data.to,
        subject: email.data.subject,
        message: email.data.message
      });
    }
  }, [email, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEdit ? 'Edit' : 'Create'} Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Write all mails you want to send(comma separated)"
                        {...field}
                        onChange={(e) => {
                          const emails = e.target.value
                            .split(',')
                            .map((email) => email.trim());
                          field.onChange(emails);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Controller
                        name="message"
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
            </div>
            <div className='flex flex-row gap-2'>
              <Button type="submit" disabled={isSubmitting}>
                Save As Template
              </Button>

              {/* <Button type="button">Send Mail</Button> */}
            <Button
              type="button"
              onClick={() => {
                const formData = form.getValues();
                axiosInstance
                  .post(`${baseUrl}/send-email`, formData, {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                  })
                  .then((response) => {
                    console.log(response.data);
                    router.push('/dashboard/email');
                    toast.success('Email sent successfully');
                  })
                  .catch(() => {
                    toast.error('Failed to send email');
                  });
              }}
            >
              Send Mail
            </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

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
  question: z.string().nonempty('Question is required'),
  answer: z.string().nonempty('Answer is required')
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
      question: '',
      answer: ''
    }
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission here
    // const formData = new FormData();
    // formData.append('question', values.question);
    // formData.append('answer', values.answer);
    // console.log(`hi${values.question}`);
    // console.log(`hi${values.answer}`);
    // console.log(formData);
    mutate({ question: values.question, answer: values.answer });
  }

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: z.infer<typeof formSchema>) => {
      const endpoint = isEdit
        ? `${apiUrl}/question-answer/${segments[4]}`
        : `${apiUrl}/question-answer`;
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
        ? 'FAQs updated successfully'
        : 'FAQs created successfully';
      toast.success(message);
      form.reset();
      router.push('/dashboard/question-answer');
    },
    onError: (error) => {
      toast.error('Something went wrong');
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // write code to get categories from serve by tanstack query

  const { data: faq } = useQuery({
    queryKey: ['answer', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/question-answer/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit // Only fetch when in edit mode
  });

  React.useEffect(() => {
    if (faq?.data) {
      form.reset({
        question: faq.data.question,
        answer: faq.data.answer
      });
    }
  }, [faq, form]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Add Questions and its Answers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Questions</FormLabel>
                    <FormControl>
                      <Input placeholder="Write  the  question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answers</FormLabel>
                    <FormControl>
                      <Controller
                        name="answer"
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

            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

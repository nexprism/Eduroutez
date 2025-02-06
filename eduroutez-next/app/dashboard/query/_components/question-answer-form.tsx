'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const statusSchema = z.object({
  status: z.enum(['Open', 'Closed']).refine((val) => val !== undefined, {
    message: 'Status is required'
  })
});

export default function QueryStatusForm() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const queryId = segments[4];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: 'Open'
    }
  });

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: z.infer<typeof statusSchema>) => {
      const response = await axiosInstance({
        url: `${apiUrl}/query/${queryId}`,
        method: 'patch',
        data: { status: data.status },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      router.push('/dashboard/query');
      queryData.refetch();
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const queryData = useQuery({
    queryKey: ['query-details', queryId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/query/${queryId}`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.data?.status) {
        form.reset({ status: data.data.status });
      }
    }
  });

  function onSubmit(values: z.infer<typeof statusSchema>) {
    mutate(values);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Query Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Input 
              value={queryData.data?.data.query || ''} 
              readOnly 
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Query Related To</label>
            <Input 
              value={queryData.data?.data.queryRelatedTo || ''} 
              readOnly 
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
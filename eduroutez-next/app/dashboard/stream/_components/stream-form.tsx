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
  SelectValue 
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  price: z.string().refine(
    (value) => {
      const price = Number(value);
      return !isNaN(price) && price >= 1 && price <= 100;
    },
    { message: 'Price must be a number between 1 and 100.' }
  ),
  streamType: z.string().optional(),
  status: z.boolean(),
});

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function StreamForm() {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const isEdit = segments.length === 5 && segments[3] === 'update';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: '',
      streamType: '',
      status: true,
    },
  });

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isEdit
        ? `${apiUrl}/stream/${segments[4]}`
        : `${apiUrl}/stream`;
      const response = await axiosInstance({
        url: endpoint,
        method: isEdit ? 'patch' : 'post',
        data,
headers: {
          'Content-Type': 'application/json',
        },
     });
      return response.data;
    },
    onSuccess: () => {
      const message = isEdit
        ? 'Stream updated successfully'
        : 'Stream created successfully';
      toast.success(message);
      form.reset();
      setPreviewUrl(null);
      router.push('/dashboard/stream');
    },
    onError: (error) => {
      console.error('API call failed:', error);
      toast.error('Something went wrong');
    },
  });



  const { data: stream } = useQuery({
    queryKey: ['stream', segments[4]],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${apiUrl}/stream/${segments[4]}`
      );
      return response.data;
    },
    enabled: isEdit,
  });

  React.useEffect(() => {
    if (stream?.data) {
      form.reset({
        name: stream.data.name,
        price: stream.data.price ? stream.data.price.toString() : '',
        streamType: stream.data.streamType,
        status: stream.data.status,
      });
   
    }
  }, [stream, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('streamType', values.streamType ?? '');
    formData.append('status', values.status ? 'true' : 'false');
    


    mutate(formData);
  };
  
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Stream Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your stream name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter stream price"
                        {...field}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          
              <FormField
                control={form.control}
                name="streamType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Type (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stream type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DEFAULT">Default</SelectItem>
                        <SelectItem value="POPULAR">Popular</SelectItem>
                        <SelectItem value="TRENDING">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'Active')} 
                      value={field.value ? 'Active' : 'Inactive'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'Active'}>Active</SelectItem>
                        <SelectItem value={'Inactive'}>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
              <Button 
                type="submit" 
                disabled={isPending}
                className="col-span-full"
              >
                {isEdit ? 'Update Stream' : 'Create Stream'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
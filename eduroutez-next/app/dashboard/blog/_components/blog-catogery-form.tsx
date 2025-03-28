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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  })
});

export default function BlogCategoryForm() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ''
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = isEdit
        ? `${apiUrl}/blog-category/${selectedCategory._id}`
        : `${apiUrl}/blog-category`;
      const response = await axiosInstance({
        url: endpoint,
        method: isEdit ? 'patch' : 'post',
        data: formData,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated successfully' : 'Category created successfully');
      form.reset();
      setSelectedCategory(null);
      setIsEdit(false);
      router.push('/dashboard/blog/blog-category');
      window.location.reload();
    },
    onError: () => toast.error('Something went wrong')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`${apiUrl}/blog-category/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
      setSelectedCategory(null);
      setIsEdit(false);
      router.push('/dashboard/blog/blog-category');
      window.location.reload();
    },
    onError: () => toast.error('Something went wrong')
  });

  const { data: categories, isLoading, isSuccess } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/blog-category?page=0`);
      return response.data;
    }
  });

  React.useEffect(() => {
    if (selectedCategory) {
      form.setValue('title', selectedCategory.name);
      setIsEdit(true);
    }
  }, [selectedCategory, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('name', values.title);
    mutate(formData);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isEdit ? 'Update Category' : 'Create Category'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Modify an existing blog category' : 'Add a new category to organize your blog posts'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter category name" 
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isEdit ? 'Update Category' : 'Create Category'}
                </Button>
                {isEdit && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(selectedCategory._id)}
                    disabled={deleteMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Category
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {isSuccess && categories?.data?.result?.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold">Existing Categories</h2>
              <div className="grid gap-4">
                {categories.data.result.map((category: any) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(category._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
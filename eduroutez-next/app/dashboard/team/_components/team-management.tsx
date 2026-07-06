'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, UserCog, Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subRole: z.string().min(1, 'Role is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StaffFormValue = z.infer<typeof staffSchema>;

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  admissions: 'Admissions Team',
  marketing: 'Marketing Team',
  hod: 'Department Head',
};

export default function TeamManagement() {
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  const form = useForm<StaffFormValue>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', email: '', subRole: '', password: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['institute-staff'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institute/staff`);
      return response.data.data;
    },
  });

  const { data: permsData, isLoading: permsLoading } = useQuery({
    queryKey: ['institute-staff-permissions'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/institute/staff-permissions`);
      return response.data.data;
    },
  });

  const [editPerms, setEditPerms] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (permsData) setEditPerms(permsData);
  }, [permsData]);

  const updatePermsMutation = useMutation({
    mutationFn: async (permissions: Record<string, string[]>) => {
      const response = await axiosInstance.patch(`${apiUrl}/institute/staff-permissions`, { permissions });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-staff-permissions'] });
      toast.success('Permissions updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update permissions');
    },
  });

  const allModules = [
    'dashboard', 'profile', 'courses', 'course-category', 'queries',
    'recommendations', 'news', 'faqs', 'question-answer', 'subscription',
    'webinar', 'blog', 'career', 'recruiter', 'promotions',
  ];

  const moduleLabels: Record<string, string> = {
    dashboard: 'Dashboard', profile: 'Profile', courses: 'Courses',
    'course-category': 'Course Category', queries: 'Queries',
    recommendations: 'Recommendations', news: 'News', faqs: 'FAQs',
    'question-answer': 'Q&A', subscription: 'Subscription',
    webinar: 'Webinars', blog: 'Blogs', career: 'Career',
    recruiter: 'Recruiter', promotions: 'Promotions',
  };

  const createMutation = useMutation({
    mutationFn: async (values: StaffFormValue) => {
      const response = await axiosInstance.post(`${apiUrl}/institute/staff`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-staff'] });
      toast.success('Staff member created');
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create staff');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<StaffFormValue> }) => {
      const response = await axiosInstance.patch(`${apiUrl}/institute/staff/${id}`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-staff'] });
      toast.success('Staff member updated');
      setOpen(false);
      setEditingStaff(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update staff');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`${apiUrl}/institute/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-staff'] });
      toast.success('Staff member deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete staff');
    },
  });

  const onSubmit = (values: StaffFormValue) => {
    if (editingStaff) {
      const payload: any = { name: values.name, subRole: values.subRole };
      if (values.password) payload.password = values.password;
      updateMutation.mutate({ id: editingStaff._id, values: payload });
    } else {
      createMutation.mutate(values);
    }
  };

  const openEdit = (staff: any) => {
    setEditingStaff(staff);
    form.reset({
      name: staff.name || '',
      email: staff.email || '',
      subRole: staff.subRole || '',
      password: '',
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingStaff(null);
    form.reset({ name: '', email: '', subRole: '', password: '' });
    setOpen(true);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Heading title="Team Management" description="Manage institute staff members and their roles" />
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>
      <Separator />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff Member'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                        placeholder="Email address"
                        {...field}
                        disabled={!!editingStaff}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
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
                    <FormLabel>{editingStaff ? 'New Password (leave blank to keep)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingStaff ? 'Update' : 'Create'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No staff members yet. Click "Add Staff" to create one.
            </p>
          )}
          {data?.map((staff: any) => (
            <Card key={staff._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  {staff.name || 'Unnamed'}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(staff)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(staff._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{staff.email}</p>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-2">
                  {roleLabels[staff.subRole] || staff.subRole}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator className="my-6" />

      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Role Permissions</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Control which modules each staff role can access.</p>

      {permsLoading ? (
        <div>Loading permissions...</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(roleLabels).map((role) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="text-sm">{roleLabels[role]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {allModules.map((mod) => (
                    <div key={`${role}-${mod}`} className="flex items-center gap-2">
                      <Checkbox
                        id={`${role}-${mod}`}
                        checked={editPerms[role]?.includes(mod) ?? false}
                        onCheckedChange={(checked) => {
                          setEditPerms((prev) => {
                            const current = prev[role] || [];
                            const next = checked
                              ? [...current, mod]
                              : current.filter((m: string) => m !== mod);
                            return { ...prev, [role]: next };
                          });
                        }}
                      />
                      <Label htmlFor={`${role}-${mod}`} className="text-sm cursor-pointer">
                        {moduleLabels[mod]}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            onClick={() => updatePermsMutation.mutate(editPerms)}
            disabled={updatePermsMutation.isPending}
          >
            Save Permissions
          </Button>
        </div>
      )}
    </div>
  );
}

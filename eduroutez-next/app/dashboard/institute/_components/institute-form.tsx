'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ResponsiveTabsList,
  ResponsiveTabsTrigger,
  Tabs,
  TabsContent
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomEditor from '@/components/custom-editor';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import GeneralInfo from './institute-form/general-info';
const courseTypes = [
  { value: 'live', label: 'Live' },
  { value: 'recorded', label: 'Recorded' },
  { value: 'hybrid', label: 'Hybrid' }
];

const orgTypes = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' }
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  courseType: z.string({
    required_error: 'Please select a course type.'
  }),
  instructor: z.string({
    required_error: 'Please select an instructor.'
  }),
  level: z.string({
    required_error: 'Please select a level.'
  }),
  shortDescription: z.any().optional(),
  longDescription: z.any().optional(),

  category: z.string({
    required_error: 'Please select a category.'
  }),
  status: z.string({
    required_error: 'Please select a status.'
  }),
  visibility: z.string({
    required_error: 'Please select a visibility option.'
  }),
  language: z.string({
    required_error: 'Please select a language.'
  }),
  isCourseFree: z.enum(['free', 'notfree'], {
    required_error: 'You need to select one option.'
  }),
  isCourseDiscounted: z.enum(['yes', 'no'], {
    required_error: 'You need to select one option.'
  }),
  applicationStartDate: z.date({
    required_error: 'Application start date is required.'
  }),
  applicationEndDate: z.date({
    required_error: 'Application end date is required.'
  }),
  thumbnail: z.any().optional(),
  cover: z.any().optional(),
  logo: z.any().optional(),
  state: z.string({
    required_error: 'Please select a state.'
  }),
  city: z.string({
    required_error: 'Please select a city.'
  }),
  phone: z.string({
    required_error: 'Please enter a phone number.'
  }),
  email: z.string({
    required_error: 'Please enter an email.'
  }),
  establishedYear: z.string({
    required_error: 'Please enter an established year.'
  }),
  website: z.string({
    required_error: 'Please enter a website.'
  }),
  address: z.string({
    required_error: 'Please enter an address.'
  }),
  about: z.string({
    required_error: 'Please enter about.'
  }),
  organizationType: z.string({
    required_error: 'Please select an organization type.'
  }),
  brochure: z.any().optional(),
  pictures: z.array(z.any())
});

export default function CreateInstitute() {
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = React.useState<
    string | null
  >(null);
  const [previewCoverUrl, setPreviewCoverUrl] = React.useState<string | null>(
    null
  );
  const [previewLogoUrl, setPreviewLogoUrl] = React.useState<string | null>(
    null
  );
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

  const fileInputThumbnailRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputLogoRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputCoverRef = React.useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const multipleFileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      longDescription: '',
      isCourseFree: 'free',
      isCourseDiscounted: 'yes'
      // city: '',
      // state: '',
      // organizationType: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    
  }
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('thumbnail', file);
    } else {
      setPreviewThumbnailUrl(null);
      form.setValue('thumbnail', undefined);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('cover', file);
    } else {
      setPreviewCoverUrl(null);
      form.setValue('cover', undefined);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('logo', file);
    } else {
      setPreviewLogoUrl(null);
      form.setValue('logo', undefined);
    }
  };

  const triggerThumbnailFileInput = () => {
    fileInputThumbnailRef.current?.click();
  };

  const triggerLogoFileInput = () => {
    fileInputLogoRef.current?.click();
  };

  const triggerCoverFileInput = () => {
    fileInputCoverRef.current?.click();
  };
  const removeThumbnailImage = () => {
    setPreviewThumbnailUrl(null);
    form.setValue('thumbnail', undefined);
    if (fileInputThumbnailRef.current) {
      fileInputThumbnailRef.current.value = ''; // Reset the file input
    }
  };

  const removeCoverImage = () => {
    setPreviewCoverUrl(null);
    form.setValue('cover', undefined);
    if (fileInputCoverRef.current) {
      fileInputCoverRef.current.value = ''; // Reset the file input
    }
  };

  const removeLogo = () => {
    setPreviewLogoUrl(null);
    form.setValue('logo', undefined);
    if (fileInputLogoRef.current) {
      fileInputLogoRef.current.value = ''; // Reset the file input
    }
  };
  const handleMultipleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const newPreviewUrls: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === files.length) {
          setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });

    const currentPictures = form.getValues('pictures');
    form.setValue('pictures', [...currentPictures, ...files]);
  };
  const removeMultipleImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    const currentPictures = form.getValues('pictures');
    form.setValue(
      'pictures',
      currentPictures.filter((_, i) => i !== index)
    );
  };
  const triggerMultipleFileInput = () => {
    multipleFileInputRef.current?.click();
  };
  return (
    <div className="container mx-auto space-y-6 py-6">
      <Tabs defaultValue="general" className="w-full">
        <ResponsiveTabsList className="flex w-full justify-evenly">
          <ResponsiveTabsTrigger value="general">General</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="college_info">
            College Information
          </ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="courses">Courses</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="admission">
            Admission
          </ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="placement">
            Placement
          </ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="campus">Campus</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="scholarship">
            Scholarship
          </ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="reviews">Reviews</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="skills">Skills</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="gallery">Gallery</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="security">
            Security
          </ResponsiveTabsTrigger>
        </ResponsiveTabsList>
        <TabsContent value="general" className="space-y-6">
          <GeneralInfo />
        </TabsContent>
        <TabsContent value="college_info" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="courses" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admission" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="placement" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campus" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scholarship" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Controller
                            name="about"
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

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="skills" className="space-y-6">
        
        </TabsContent>
        <TabsContent value="gallery" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="pictures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleMultipleImageChange}
                              ref={multipleFileInputRef}
                              className="hidden"
                              multiple
                            />

                            <ScrollArea className="h-72 w-full rounded-md border p-4">
                              <div className="flex flex-wrap gap-4">
                                {previewUrls.map((url, index) => (
                                  <div
                                    key={index}
                                    className="relative top-2 inline-block"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      className="h-24 w-24 rounded-md object-cover"
                                      width={96}
                                      height={96}
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute right-0 top-0 -mr-2 -mt-2"
                                      onClick={() => removeMultipleImage(index)}
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">
                                        Remove image
                                      </span>
                                    </Button>
                                  </div>
                                ))}
                                <div
                                  onClick={triggerMultipleFileInput}
                                  className="mt-2 flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border border-dashed"
                                >
                                  <Plus className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>
                            </ScrollArea>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter old password"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter old password"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Repeat your password here"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Save & Update</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

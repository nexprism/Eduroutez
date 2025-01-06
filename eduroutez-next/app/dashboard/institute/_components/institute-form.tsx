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
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import GeneralInfo from './institute-form/general-info';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { add } from 'date-fns';
import { title } from 'process';
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
  institutePhone: z.string().optional(),
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
  pictures: z.array(z.any()),
  admissionInfo: z.string(),
  placementInfo: z.string(),
  campusInfo: z.string().optional(),
gallery:z.array(z.any()).optional(),
facility: z.array(z.string()).optional(),

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
  const multipleFileInputRef = React.useRef<HTMLInputElement | null>(null);
  
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);

  React.useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
    }
  }, [segments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [galleryImages, setGalleryImages] = useState<string[]>([]); // Initialize state for gallery images

  const fetchInstituteData = async () => {
    try {
      const id = segments[4];
      const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
      const instituteData = response.data.data;
      console.log('Institute data:', instituteData);
  
      // Fetch image URLs for gallery images
      const fetchedGalleryImages = await Promise.all(
        instituteData.gallery.map(async (image: any) => {
          const imageResponse = await axiosInstance.get(`http://localhost:4001/api/uploads/${image}`,{
          responseType: 'blob'
          });
          const imageUrl = URL.createObjectURL(imageResponse.data);
          return imageUrl;    // Assuming this returns the image URL
        })
      );
  
      // Update the form and gallery images state
      form.reset({
        institutePhone: instituteData.institutePhone,
        email: instituteData.email,
        establishedYear: instituteData.establishedYear,
        organizationType: instituteData.organizationType,
        website: instituteData.website,
        city: instituteData.city,
        state: instituteData.state,
        address: instituteData.address,
        about: instituteData.about,
        admissionInfo: instituteData.admissionInfo,
        placementInfo: instituteData.placementInfo,
        campusInfo: instituteData.campusInfo,
        gallery: fetchedGalleryImages, // Update gallery with the fetched images
      });
  
      setGalleryImages(fetchedGalleryImages); // Update gallery images state
    } catch (error) {
      console.error('Error fetching institute data:', error);
    }
  };
  
  useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
      fetchInstituteData();
    }
  }, []);

  const handleFormSubmit = async () => {
    try {
      const values = form.getValues();
  

      const id = segments[4];
      console.log('Form values:', values);
      const endpoint = `${apiUrl}/institute/${id}`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: 'patch',
        data: values,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
   
      console.log('Institute updated successfully:', response.data);
      toast.success('Institute updated successfully!')
      // Add success notification or redirect here
    } catch (error:any) 
    { 
console.log('Error updating institute:', error.message); }
  };

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


  const addFacility = async () => {
    try {
      const id = segments[4];
      console.log('Adding facility...');
      const values = form.getValues();
      console.log('Facility values:', values);
      const response = await axiosInstance.post(
        `http://localhost:4001/api/v1/addfacility/${id}`,
        { title: values.facility }
      );
      console.log('Facility added successfully:', response.data);
      console.log('Facility added successfully:', response.data);
      toast.success('Facility added successfully!');
    } catch (error) {
      console.error('Error adding facility:', error);
      toast.error('Failed to add facility');
    }
  };

  const handleMultipleImageChange = async (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  
    // Show preview of selected images
    const previewArray = Array.from(files).map((file: any) => {
      return URL.createObjectURL(file);
    });
    
    setPreviewUrls((prev) => [...prev, ...previewArray]);
  
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('gallery', files[i]);
    }
  
    try {
      const id = segments[4];
      const response = await axiosInstance.post(`/addGallery/${id}`, formData, {
        withCredentials: true,
      });
  
      console.log('Response:', response.data);
      if (response.data.data) {
        const imageUrls = await Promise.all(
          response.data.data.gallery.map(async (image: any) => {
            const imageResponse = await axiosInstance.get(
              `http://localhost:4001/api/uploads/${image}`,
              { responseType: 'blob' }
            );
            const imageUrl = URL.createObjectURL(imageResponse.data);
            return imageUrl;
          })
          
        );
  
        window.location.reload();
        // Update the state with the new image URLs
        setPreviewUrls((prev) => [...prev, ...imageUrls]);


        console.log('yest') 
        toast.success('Image Added Successfully!');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
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

  const triggerMultipleFileInput = () => {
    multipleFileInputRef.current?.click();
  };

  const removeThumbnailImage = () => {
    setPreviewThumbnailUrl(null);
    form.setValue('thumbnail', undefined);
    if (fileInputThumbnailRef.current) {
      fileInputThumbnailRef.current.value = '';
    }
  };

  const removeCoverImage = () => {
    setPreviewCoverUrl(null);
    form.setValue('cover', undefined);
    if (fileInputCoverRef.current) {
      fileInputCoverRef.current.value = '';
    }
  };

  const removeLogo = () => {
    setPreviewLogoUrl(null);
    form.setValue('logo', undefined);
    if (fileInputLogoRef.current) {
      fileInputLogoRef.current.value = '';
    }
  };

  const removeMultipleImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    const currentPictures = form.getValues('pictures');
    form.setValue(
      'pictures',
      currentPictures.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Tabs defaultValue="general" className="w-full">
        
        <ResponsiveTabsList className="flex w-full justify-evenly">
          <ResponsiveTabsTrigger value="general">General</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="college_info">College Information</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="admission">Admission</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="placement">Placement</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="scholarship">Scholarship</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="gallery">Gallery</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="campus">Campus</ResponsiveTabsTrigger>
          <ResponsiveTabsTrigger value="facility">Facility</ResponsiveTabsTrigger>
        </ResponsiveTabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralInfo />
        </TabsContent>

        <TabsContent value="college_info" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <CustomEditor
                            value={field.value}
                            onChange={(value: any) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleFormSubmit}>
                      Save & Update
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admission" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Admission Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="admissionInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <CustomEditor
                            value={field.value}
                            onChange={(value: any) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleFormSubmit}>
                      Save & Update
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placement" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Placement Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="placementInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <CustomEditor
                            value={field.value}
                            onChange={(value: any) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleFormSubmit}>
                      Save & Update
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarship" className="space-y-6">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Scholarship Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <CustomEditor
                            value={field.value}
                            onChange={(value: any) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleFormSubmit}>
                      Save & Update
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card> 
        </TabsContent>

        <TabsContent value="campus" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Campus Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="campusInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campus Details</FormLabel>
                        <FormControl>
                          <CustomEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleFormSubmit}>
                      Save & Update
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="gallery">
  <Card>
    <CardHeader>
      <CardTitle>Gallery</CardTitle>
      <p className="text-sm text-gray-600">
        Add images to showcase your institute's gallery.
      </p>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Multiple Image Upload */}
        <div className="flex items-center space-x-4">
          <Button type="button" onClick={triggerMultipleFileInput}>
            Add Images
          </Button>
          <Input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={multipleFileInputRef}
            onChange={handleMultipleImageChange}
          />
        </div>
        {/* Preview Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {/* Render fetched gallery images */}
          
          {galleryImages.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Preview ${index}`}
                width={150}
                height={150}
                className="rounded-md object-cover w-full h-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full"
                onClick={() => removeMultipleImage(index)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="facility">
  <Card>
    <CardHeader>
      <CardTitle>Facility</CardTitle>
      <p className="text-sm text-gray-600">
        Add facilities provided by your institute.
      </p>
          
    </CardHeader>
    <CardContent>
      <Form {...form}>
          <div className="space-y-6">
              <FormField
                control={form.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter facility"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={addFacility}
              >
                Add Facility
              </Button>
</div>
</Form>
</CardContent>
</Card>
</TabsContent>

        </Tabs>
    </div>
  );
}


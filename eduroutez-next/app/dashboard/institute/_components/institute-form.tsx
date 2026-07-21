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
import { stringField, emailField, urlField, optionalStringField, noEmoji } from '@/lib/validations';
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
  title: stringField('Title'),
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
  email: emailField,
  establishedYear: z.any({
    required_error: 'Please enter an established year.'
  }),
  website: z.string({
    required_error: 'Please enter a website.'
  }).refine((val) => !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u.test(val), {
    message: 'Website cannot contain emojis',
  }),
  address: z.string({
    required_error: 'Please enter an address.'
  }).refine((val) => !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u.test(val), {
    message: 'Address cannot contain emojis',
  }),
  about: z.string({
    required_error: 'Please enter about.'
  }).refine((val) => !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u.test(val), {
    message: 'About cannot contain emojis',
  }),
  organisationType: z.string({
    required_error: 'Please select an organization type.'
  }),
  brochure: z.any().optional(),
  pictures: z.array(z.any()),
  admissionInfo: z.string(),
  placementInfo: z.string(),
  campusInfo: z.string().optional(),
  gallery:z.array(z.any()).optional(),
  facility: z.array(z.string()).optional(),
  scholarshipInfo: z.string().optional(),
  fee: z.string().optional(),
  ranking: z.string().optional(),
  cutoff: z.string().optional(),
  metaTitle: optionalStringField('Meta Title'),
  metaDescription: optionalStringField('Meta Description'),
  metaKeywords: optionalStringField('Meta Keywords'),
  canonicalUrl: optionalStringField('Canonical URL'),
  ogImage: optionalStringField('OG Image'),
  metaImage: z.any().optional(),
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
  const [previewMetaImageUrl, setPreviewMetaImageUrl] = React.useState<string | null>(null);

  const fileInputThumbnailRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputMetaImageRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputLogoRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputCoverRef = React.useRef<HTMLInputElement | null>(null);
  const multipleFileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [pastFacilities, setPastFacilities] = useState<string[]>([]); 
  
  
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
  const baseURL =process.env.NEXT_PUBLIC_NEW_IMAGES;


  const [galleryImages, setGalleryImages] = useState<string[]>([]); // Initialize state for gallery images



  const ImageUrl = process.env.NEXT_PUBLIC_NEW_IMAGES;

  const fetchInstituteData = async () => {
    try {
      const id = segments[4];
      console.log("Fetching institute data...");
      const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
      const instituteData = response.data.data;
      console.log("Institute data:", instituteData);
  
      // Convert filenames to URLs for rendering in the frontend
      const galleryUrls = instituteData.gallery.map(
        (filename: string) => `${ImageUrl}/${filename}`
      );

      setPastFacilities(instituteData.facilities || []);

  
      console.log("Gallery URLs for rendering:", galleryUrls);
  
      // Update the form and gallery images state
      form.reset({
        institutePhone: instituteData.institutePhone,
        email: instituteData.email,
        establishedYear: instituteData.establishedYear,
        organisationType: instituteData.organisationType,
        website: instituteData.website,
        city: instituteData.city,
        state: instituteData.state,
        address: instituteData.address,
        about: instituteData.about,
        admissionInfo: instituteData.admissionInfo,
        placementInfo: instituteData.placementInfo,
        campusInfo: instituteData.campusInfo,
        gallery: instituteData.gallery, // Keep filenames in the form
        scholarshipInfo: instituteData.scholarshipInfo,
        fee: instituteData.fee,
        ranking: instituteData.ranking,
        cutoff: instituteData.cutoff,
        thumbnail: instituteData.thumbnailImage,
        cover: instituteData.coverImage,
         logo: instituteData.instituteLogo,
         metaTitle: instituteData.metaTitle || '',
         metaDescription: instituteData.metaDescription || '',
         metaKeywords: instituteData.metaKeywords || '',
         canonicalUrl: instituteData.canonicalUrl || '',
         ogImage: instituteData.ogImage || '',
         metaImage: instituteData.metaImage || ''
      });
      console.log("Form values:", );
      console.log('organisationType',instituteData.organisationType)
      setPreviewThumbnailUrl(`${baseURL}/${instituteData.thumbnailImage}`);
      setPreviewCoverUrl(`${baseURL}/${instituteData.coverImage}`);
      setPreviewLogoUrl(`${baseURL}/${instituteData.instituteLogo}`);
  
      setPreviewMetaImageUrl(instituteData.metaImage ? `${baseURL}/${instituteData.metaImage}` : null);
      setGalleryImages(galleryUrls); // Set the full URLs for rendering
    } catch (error) {
      console.error("Error fetching institute data:", error);
    }
  };

  const handleMetaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewMetaImageUrl(reader.result as string);
      reader.readAsDataURL(file);
      form.setValue('metaImage', file);
    } else {
      setPreviewMetaImageUrl(null);
      form.setValue('metaImage', undefined);
    }
  };

  const removeMetaImage = () => {
    setPreviewMetaImageUrl(null);
    form.setValue('metaImage', undefined);
    if (fileInputMetaImageRef.current) {
      fileInputMetaImageRef.current.value = '';
    }
  };


  const deleteFacility = async (facility: string) => {
    try {
      const id = segments[4];
      console.log('Deleting facility:', facility);
      const response = await axiosInstance.post(`${apiUrl}/delete-facility/${id}`, {
       facility 
      });
      
      // Update the facilities list after successful deletion
      setPastFacilities(prevFacilities => 
        prevFacilities.filter(f => f !== facility)
      );
      
      console.log('Facility deleted successfully:', response.data);
      toast.success('Facility deleted successfully!');
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast.error('Failed to delete facility');
    }
  };
  
  useEffect(() => {
   
      setIsEdit(true);
      fetchInstituteData();
    
  }, []);

  const handleFormSubmit = async () => {
    try {
      const values = form.getValues();
  

      const id = segments[4];
      console.log('Form values:', values);
      delete values.gallery; // Remove gallery from the form data
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
      if (file.size > 30 * 1024) {
        toast.error('Thumbnail size must be less than 30 KB.');
        setPreviewThumbnailUrl(null);
        form.setValue('thumbnail', undefined);
        if (fileInputThumbnailRef.current) {
          fileInputThumbnailRef.current.value = '';
        }
        return;
      }
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
      if (file.size > 50 * 1024) {
        toast.error('Cover image size must be less than 50 KB.');
        setPreviewCoverUrl(null);
        form.setValue('cover', undefined);
        if (fileInputCoverRef.current) {
          fileInputCoverRef.current.value = '';
        }
        return;
      }
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
      if (file.size > 20 * 1024) {
        toast.error('Logo size must be less than 20 KB.');
        setPreviewLogoUrl(null);
        form.setValue('logo', undefined);
        if (fileInputLogoRef.current) {
          fileInputLogoRef.current.value = '';
        }
        return;
      }
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
        `${apiUrl}/addfacility/${id}`,
        { title: values.facility }
      );
      fetchInstituteData();
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

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 30 * 1024) {
        toast.error(`Gallery image "${files[i].name}" exceeds the 30 KB limit.`);
        if (multipleFileInputRef.current) {
          multipleFileInputRef.current.value = '';
        }
        return;
      }
    }
  
    // Show temporary previews of selected images
    const previewArray = Array.from(files).map((file: any) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...previewArray]);
  
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('gallery', files[i]);
    }
  
    try {
      const id = segments[4];
      console.log('FormData:', formData);
      const response = await axiosInstance.post(`/addGallery/${id}`, formData, {
        withCredentials: true,
      });
  
      console.log('Response:', response.data);
      if (response.data.data) {
        // Get file names from backend response
        const fileNames = response.data.data.gallery;
  
        // Construct URLs by appending file names to the base path
        const imageUrls = fileNames.map(
          (fileName: string) => `${fileName}`
        );
  
        fetchInstituteData();  
        // Update the state with the new image URLs
        setPreviewUrls((prev) => [...prev, ...imageUrls]);
  
        toast.success('Images added successfully!');
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

  const removeImage = async (url: string, index: number) => {
    try {
      const id = segments[4];
      const imageName = url.split('/').pop(); // Extract the image name from the URL
      const response = await axiosInstance.post(`${apiUrl}/deleteGallery/${id}`, {
        image: imageName
      });
      console.log('Image deleted successfully:', response.data);
      toast.success('Image deleted successfully!');
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
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
          <ResponsiveTabsTrigger value="fee">Fee</ResponsiveTabsTrigger>
             <ResponsiveTabsTrigger value="ranking">Ranking</ResponsiveTabsTrigger>
                    <ResponsiveTabsTrigger value="cutoff">Cut-Offs</ResponsiveTabsTrigger>
                    <ResponsiveTabsTrigger value="facility">Facility</ResponsiveTabsTrigger>
                    <ResponsiveTabsTrigger value="seo">SEO</ResponsiveTabsTrigger>
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
                    name="scholarshipInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>scholarship Info</FormLabel>
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
      <CardTitle>Gallery (Max size: 30KB each)</CardTitle>
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
                onClick={() => removeImage(url, index)}
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
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Past Facilities</h3>
              <ul className="space-y-2">
                {pastFacilities && pastFacilities.length > 0 ? (
                  pastFacilities.map((facility, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{facility}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFacility(facility)}
                      >
                        <X size={16} className="mr-1" />
                        Delete
                      </Button>
                    </li>
                  ))
                ) : (
                  <li>No facilities available</li>
                )}
              </ul>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  </TabsContent>


  <TabsContent value="fee">
    <Card>
      <CardHeader>
        <CardTitle>Fee Structure</CardTitle>
        <p className="text-sm text-gray-600">
          Add fee structure details for your institute.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Structure</FormLabel>
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
            <Button type="button" onClick={handleFormSubmit}>
              Save & Update
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  </TabsContent>
  
  <TabsContent value="ranking">
    <Card>
      <CardHeader>
        <CardTitle>Ranking</CardTitle>
        <p className="text-sm text-gray-600">
          Add ranking details for your institute.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="ranking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ranking</FormLabel>
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
            <Button type="button" onClick={handleFormSubmit}>
              Save & Update
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  </TabsContent>
  
  <TabsContent value="cutoff">
    <Card>
      <CardHeader>
        <CardTitle>Cut-Offs</CardTitle>
        <p className="text-sm text-gray-600">
          Add cut-off details for your institute.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="cutoff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cut-Offs</FormLabel>
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
            <Button type="button" onClick={handleFormSubmit}>
              Save & Update
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="seo">
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <p className="text-sm text-gray-600">
          Configure SEO meta tags for your institute page.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter meta title for SEO" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="keyword1, keyword2, keyword3" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meta description for SEO" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaImage"
              render={() => (
                <FormItem>
                  <FormLabel>Meta Image (OG Image)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleMetaImageChange}
                        ref={fileInputMetaImageRef}
                        className="hidden"
                      />
                      {previewMetaImageUrl ? (
                        <div className="relative inline-block">
                          <Image
                            src={previewMetaImageUrl}
                            alt="Meta Image Preview"
                            className="h-40 w-full rounded-md object-cover"
                            width={200}
                            height={160}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-0 top-0 -mr-2 -mt-2"
                            onClick={removeMetaImage}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove meta image</span>
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputMetaImageRef.current?.click()}
                          className="border-grey-300 flex h-40 w-full cursor-pointer items-center justify-center rounded-md border"
                        >
                          <Plus className="text-grey-400 h-10 w-10" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" onClick={handleFormSubmit}>
              Save & Update
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


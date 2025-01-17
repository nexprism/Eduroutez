import CustomEditor from '@/components/custom-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
  instituteName: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  thumbnail: z.any().optional(),
  cover: z.any().optional(),
  logo: z.any().optional(),
  maxFees: z.any().optional(),
  minFees: z.any().optional(),
  affiliation: z.any().optional(),
  highestPackage: z.any().optional(),
  streams:z.any().optional(),
  specialization:z.any().optional(),
  state: z.string({
    required_error: 'Please select a state.'
  }),
  city: z.string({
    required_error: 'Please select a city.'
  }),
  institutePhone: z.string({
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
  brochure: z.any().optional()
});

const GeneralInfo = () => {
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = React.useState<
    string | null
  >(null);
  const [previewCoverUrl, setPreviewCoverUrl] = React.useState<string | null>(
    null
  );
  const [previewLogoUrl, setPreviewLogoUrl] = React.useState<string | null>(
    null
  );
    const [previewbrochure, setPreviewbrochure] = React.useState<string | null>(
      null
    );
  const baseURL = process.env.NEXT_PUBLIC_NEW_IMAGES;
  ;

  const fileInputThumbnailRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputLogoRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputCoverRef = React.useRef<HTMLInputElement | null>(null);
    const fileInputBrochureRef = React.useRef<HTMLInputElement | null>(null);

  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);


  const fetchInstituteData = async () => {
    try {
      const id = segments[4];
      const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
      const instituteData = response.data.data;

      form.reset({
        instituteName: instituteData.instituteName,
        institutePhone: instituteData.institutePhone,
        email: instituteData.email,
        establishedYear: instituteData.establishedYear,
        organizationType: instituteData.organizationType,
        website: instituteData.website,
        city: instituteData.city,
        state: instituteData.state,
        address: instituteData.address,
        about: instituteData.about,
        minFees: instituteData.minFees,
        maxFees: instituteData.maxFees,
        affiliation: instituteData.affiliation,
        highestPackage: instituteData.highestPackage,
        streams: instituteData.streams,
        specialization: instituteData.specialization,
        thumbnail: instituteData.thumbnailImage,
        cover: instituteData.coverImage,
        logo: instituteData.instituteLogo,
        brochure: instituteData.brochure
      });
      console.log('Institute fetch nb:', instituteData.thumbnailImage);
              // Get images URLs 
              setPreviewThumbnailUrl(`${baseURL}/${instituteData.thumbnailImage}`);
              setPreviewCoverUrl(`${baseURL}/${instituteData.coverImage}`);
              setPreviewLogoUrl(`${baseURL}/${instituteData.instituteLogo}`);
              setPreviewbrochure(`${baseURL}/${instituteData.brochure}`);
      console.log('Institute fetch successfully:', instituteData);
    } catch (error: any) {
      console.log('Error fetching institute:', error.message);
    }
  };
  
  useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
      fetchInstituteData();
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instituteName:'',
      institutePhone:'',
      email:'',
      establishedYear:'',
      organizationType:'',
      website:'',
      city:'',
      state:'',
      address:'',
      about:'',
      minFees:'',
      maxFees:'',
      affiliation:'',
      highestPackage:'',
      streams:'',
      specialization:'',
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('hi')
    const formData = new FormData();
    formData.append('instituteName', values.instituteName);
    formData.append('institutePhone', values.institutePhone);
    formData.append('email', values.email);
    formData.append('establishedYear', values.establishedYear);
    formData.append('organizationType', values.organizationType);
    formData.append('website', values.website);
    formData.append('city', values.city);
    formData.append('state', values.state);
    formData.append('address', values.address);
    formData.append('about', values.about);
    formData.append('minFees', values.minFees);
    formData.append('maxFees', values.maxFees);
    formData.append('affiliation', values.affiliation);
    formData.append('highestPackage', values.highestPackage);
    formData.append('streams', values.streams);
    formData.append('specialization', values.specialization);
    if (values.logo) {
      formData.append('instituteLogo', values.logo);
    }
    if (values.thumbnail) {
      formData.append('thumbnailImage', values.thumbnail);
    }
    if (values.cover) {
      formData.append('coverImage', values.cover);
    }
    if (values.brochure) {
      formData.append('brochure', values.brochure);
    }

    mutate(formData);
  }

  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const endpoint = `${apiUrl}/institute/${segments[4]}`;
      const response = await axiosInstance({
        url: `${endpoint}`,
        method: 'patch',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = ' updated successfully';
      toast.success(message);
      form.reset();
      setPreviewThumbnailUrl(null);
      setPreviewCoverUrl(null);
      setPreviewLogoUrl(null);
      router.push('/dashboard/institute');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });

   const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewbrochure(reader.result as string);
        };
        reader.readAsDataURL(file);
        form.setValue('brochure', file);
      } else {
        setPreviewbrochure(null);
        form.setValue('brochure', undefined);
      }
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

  const triggerThumbnailFileInput = () => {
    fileInputThumbnailRef.current?.click();
  };

  const triggerLogoFileInput = () => {
    fileInputLogoRef.current?.click();
  };

  const triggerCoverFileInput = () => {
    fileInputCoverRef.current?.click();
  };

  const triggerBrochureFileInput = () => {
    fileInputBrochureRef.current?.click();
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

  const removeBrochure = () => {
    setPreviewbrochure(null);
    form.setValue('brochure', undefined);
    if (fileInputBrochureRef.current) {
      fileInputBrochureRef.current.value = ''; // Reset the file input
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                              if (Object.keys(errors).length > 0) {
                                toast.error(
                                  'Please correct the errors in the form before submitting.'
                                );
                              }
                            })} className="space-y-8">
            <FormField
              control={form.control}
              name="instituteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Institute Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <FormField
                control={form.control}
                name="institutePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Title"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="establishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Year</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Title"
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
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Organization Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orgTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Fees</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter minimum Fees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Fees</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter maximum fees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your affiliation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="highestPackage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Package</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter highest Package" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
                <FormField
                  control={form.control}
                  name="streams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streams (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add streams like -> designing, developing, marketing"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add specializations like -> AI, ML, Data Science"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <Textarea placeholder="Enter address" {...field} cols={10} />
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleLogoChange}
                          ref={fileInputLogoRef} // Reference to reset input
                          className="hidden "
                        />

                        {previewLogoUrl ? (
                          <div className="relative ">
                            <Image
                              src={previewLogoUrl}
                              alt="Preview"
                              className="max-h-[200px] max-w-full rounded-md object-cover"
                              width={1200}
                              height={1200}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removeLogo}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerLogoFileInput}
                            className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
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
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleThumbnailChange}
                          ref={fileInputThumbnailRef} // Reference to reset input
                          className="hidden "
                        />
      
                        {previewThumbnailUrl ? (
                          <div className="relative">
                            <Image
                              src={previewThumbnailUrl}
                              alt="Preview"
                              className="max-h-[200px] max-w-full rounded-md object-cover"
                              width={1200}
                              height={1200}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removeThumbnailImage}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerThumbnailFileInput}
                            className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
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
              <FormField
                control={form.control}
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleCoverChange}
                          ref={fileInputCoverRef} // Reference to reset input
                          className="hidden"
                        />

                        {previewCoverUrl ? (
                            <div className="relative">
                            <Image
                              src={previewCoverUrl}
                              alt="Preview"
                              className="max-h-[200px] max-w-full rounded-md object-cover"
                              width={1200}
                              height={1200}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2"
                              onClick={removeCoverImage}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                            </div>
                        ) : (
                          <div
                            onClick={triggerCoverFileInput}
                            className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
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
            </div>

           <FormField
                         control={form.control}
                         name="brochure"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Brochure</FormLabel>
                             <FormControl>
                               <div className="space-y-4">
                                 <Input
                                   type="file"
                                   accept="image/png, image/jpeg, image/webp"
                                   onChange={handleBrochureChange}
                                   ref={fileInputBrochureRef} // Reference to reset input
                                   className="hidden "
                                 />
           
                                 {previewbrochure ? (
                                   <div className="relative">
                                     <Image
                                       src={previewbrochure}
                                       alt="Preview"
                                       className="max-h-[200px] max-w-full rounded-md object-cover"
                                       width={1200}
                                       height={1200}
                                     />
                                     <Button
                                       type="button"
                                       variant="destructive"
                                       size="icon"
                                       className="absolute right-0 top-0 -mr-2 -mt-2"
                                       onClick={removeBrochure}
                                     >
                                       <X className="h-4 w-4" />
                                       <span className="sr-only">Remove image</span>
                                     </Button>
                                   </div>
                                 ) : (
                                   <div
                                     onClick={triggerBrochureFileInput}
                                     className="border-grey-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-md border"
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

            <div className="flex justify-end">
              <Button type="submit">Save & Update</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GeneralInfo;

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
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import tr from 'date-fns/esm/locale/tr/index';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseURL =process.env.NEXT_PUBLIC_NEW_IMAGES;
;


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
  examAccepted: z.string().optional(), // Add this line
  state: z.any({
    required_error: 'Please select a state.'
  }),
  city: z.any({
    required_error: 'Please select a city.'
  }),
  institutePhone: z.string({
    required_error: 'Please enter a phone number.'
  }),
  email: z.string({
    required_error: 'Please enter an email.'
  }),
  establishedYear: z.any({
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
  organisationType: z.string({
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

  const fileInputThumbnailRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputLogoRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputCoverRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputBrochureRef = React.useRef<HTMLInputElement | null>(null);

  interface State {
    id: string;
    _id: string;
    name: string;
  }
  
  interface City {
    id: Key | null | undefined;
    _id: string;
    name: string;
  }
  
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const pathname = usePathname();
  const segments = pathname.split('/');
  const [isEdit, setIsEdit] = React.useState(false);
  const [streams, setStreams] = React.useState<Stream[]>([]);
  const [selectedStreams, setSelectedStreams] = React.useState<string[]>([]);

  // Add this useEffect to fetch streams
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/streams`,
          {
            params: {
              page: 0
            }
          }
        );
        console.log('streams',response.data);
        setStreams(response.data?.data?.result || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        toast.error('Failed to load streams');
      }
    };
    fetchStreams();
  }, []);


    useEffect(() => {
      const fetchData = async () => {
        const id = localStorage.getItem('instituteId');
        const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
        const instituteData = response.data.data;

        if(instituteData?.state) {
          var stateResponse = await axiosInstance.post(`${apiUrl}/state-city-by-id/${instituteData.state}`, { type: "state" });
          console.log('State response:', stateResponse.data?.data[0]);
          var stateData = stateResponse.data?.data[0];
      }
      if(instituteData?.city) {
          var cityResponse = await axiosInstance.post(`${apiUrl}/state-city-by-id/${instituteData.city}`, { type: "city" });
          console.log('City response:', cityResponse.data?.data[0]);
          var stateCityData = cityResponse.data?.data[0];
      }

      if (instituteData?.streams) {
        setSelectedStreams(instituteData.streams);
      }

        form.reset({
          instituteName: instituteData.instituteName,
          institutePhone: instituteData.institutePhone,
          email: instituteData.email,
          establishedYear: instituteData.establishedYear,
          organisationType: instituteData.organisationType,
          website: instituteData.website,
          city: stateCityData?.id,
          state: stateData?.id,
          address: instituteData.address,
          about: instituteData.about,
          minFees: instituteData.minFees,
          maxFees: instituteData.maxFees,
          affiliation: instituteData.affiliation,
          highestPackage: instituteData.highestPackage,
          streams: instituteData.streams,
          specialization: instituteData.specialization,
          examAccepted: instituteData.examAccepted, // Add this line
          thumbnail: instituteData.thumbnailImage,
          cover: instituteData.coverImage,
          logo: instituteData.instituteLogo,
          brochure: instituteData.brochure
        });

        setPreviewThumbnailUrl(instituteData.thumbnailImage ? `${baseURL}/${instituteData.thumbnailImage}` : null);
        setPreviewCoverUrl(instituteData.coverImage ? `${baseURL}/${instituteData.coverImage}` : null);
        setPreviewLogoUrl(instituteData.instituteLogo ? `${baseURL}/${instituteData.instituteLogo}` : null);
        setPreviewbrochure(instituteData.brochure ? `${baseURL}/${instituteData.brochure}` : null);
      };

      fetchData();
    }, [pathname]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instituteName:'',
      institutePhone:'',
      email:'',
      establishedYear:'',
      organisationType:'',
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
      examAccepted: '', // Add this line
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('hi')
    const formData = new FormData();
    formData.append('instituteName', values.instituteName);
    formData.append('institutePhone', values.institutePhone);
    formData.append('email', values.email);
    formData.append('establishedYear', values.establishedYear);
    formData.append('organisationType', values.organisationType);
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
    formData.append('examAccepted', values.examAccepted); // Add this line
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
      const id = localStorage.getItem('instituteId');
      const endpoint = `${apiUrl}/institute/${id}`;
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

    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });
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


  // Fetch all states on component mount
useEffect(() => {
  const fetchStates = async () => {
    try {
      const res = await axiosInstance.get(`${apiUrl}/states`);
      setStates(res.data?.data);
    } catch (err) {
      console.error("Failed to fetch states:", err);
      toast.error("Failed to load states");
    }
  };
  fetchStates();
}, []);

// Fetch cities when a state is selected
useEffect(() => {
  const fetchCities = async () => {
    const selectedState = form.getValues('state');
    console.log('Selected state:', selectedState);
    console.log('Form:', form.getValues());
    if (selectedState) {
      try {
        const res = await axiosInstance.get(`${apiUrl}/cities-by-state/${selectedState}`);
        setCities(res.data?.data);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        toast.error("Failed to load cities");
      }
    } else {
      setCities([]); // Reset cities when no state is selected
    }
  };
  fetchCities();
}, [form.watch('state')]);


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
  }

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
                name="organisationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}                     >
                    
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Organization Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
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
      <Select
        onValueChange={(value) => {
          const selectedState = states.find(state => state.name === value);
          field.onChange(selectedState ? selectedState.id : '');
        }}
        value={states.find(state => state.id === field.value)?.name || ''}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-60 overflow-y-auto">
          {states.map((state) => (
            <SelectItem key={state.id} value={state.name}>
              {state.name}
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
  name="city"
  render={({ field }) => (
    <FormItem>
      <FormLabel>City</FormLabel>
      <Select
        onValueChange={(value) => {
          const selectedCity = cities.find(city => city.name === value);
          field.onChange(selectedCity ? selectedCity.id : '');
        }}
        value={cities.find(city => city.id === field.value)?.name || ''}
        disabled={!form.getValues('state')}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-60 overflow-y-auto">
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.name}>
              {city.name}
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
                         <FormLabel>Streams</FormLabel>
                         <FormControl>
                           <div className="relative">
                             <Select
                               onValueChange={(value) => {
                                 const currentStreams = field.value || [];
                                 if (!currentStreams.includes(value)) {
                                   const newStreams = [...currentStreams, value];
                                   field.onChange(newStreams);
                                   setSelectedStreams(newStreams);
                                 }
                               }}
                             >
                               <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Select streams" />
                               </SelectTrigger>
                               <SelectContent className="max-h-60 overflow-y-auto">
                                 {streams.map((stream) => (
                                   <SelectItem
                                     key={stream.id}
                                     value={stream.name}
                                     disabled={selectedStreams.includes(stream.name)}
                                   >
                                     {stream.name}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             
                             {/* Selected streams display */}
                             <div className="mt-2 flex flex-wrap gap-2">
                               {selectedStreams.map((streamName) => (
                                 <div
                                   key={streamName}
                                   className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1"
                                 >
                                   <span>{streamName}</span>
                                   <button
                                     type="button"
                                     onClick={() => {
                                       const newStreams = selectedStreams.filter(
                                         (s) => s !== streamName
                                       );
                                       setSelectedStreams(newStreams);
                                       field.onChange(newStreams);
                                     }}
                                     className="ml-1 text-red-500 hover:text-red-700"
                                   >
                                     <X className="h-3 w-3" />
                                   </button>
                                 </div>
                               ))}
                             </div>
                           </div>
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
                  name="examAccepted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Accepted</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter exams accepted" {...field} />
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
                          <div className="relative">
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
                          <div className="relative ">
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
                              className="absolute right-0 top-0 -mr-2 -mt-2"
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
                      accept="image/png, image/jpeg, image/webp, application/pdf"
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

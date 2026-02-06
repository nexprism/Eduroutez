"use client";
import { Key } from '@/types/common';
import { useState } from 'react';
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
import { Console, count } from 'console';

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
  streams: z.any().optional(),
  specialization: z.any().optional(),
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
  establishedYear: z.any().optional(),
  website: z.string({
    required_error: 'Please enter a website.'
  }),
  address: z.string({
    required_error: 'Please enter an address.'
  }),
  // about: z.string({
  //   required_error: 'Please enter about.'
  // }),
  organisationType: z.string({
    required_error: 'Please select an organization type.'
  }),
  brochure: z.any().optional(),
  examAccepted: z.string().optional(),
  country: z.any(),
  rank: z.any().optional()
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
  interface State {
    iso2: any;
    id: string;
    _id: string;
    name: string;
  }

  interface City {
    id: Key | null | undefined;
    _id: string;
    name: string;
  }
  interface Country {
    id: string;
    name: string;
    iso2: string;
  }

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [statesLoaded, setStatesLoaded] = useState(false);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [initialCountryName, setInitialCountryName] = useState("");
  const [initialStateName, setInitialStateName] = useState("");
  const [initialCityName, setInitialCityName] = useState("");
  const fileInputBrochureRef = React.useRef<HTMLInputElement | null>(null);

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
              page: 0,
              limit: 200
            }
          }
        );
        console.log('streams', response.data);
        setStreams(response.data?.data?.result || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        toast.error('Failed to load streams');
      }
    };
    fetchStreams();
  }, []);


  const fetchInstituteData = async () => {
    try {
      const id = segments[4];
      const response = await axiosInstance.get(`${apiUrl}/institute/${id}`);
      const instituteData = response.data.data;

      console.log('Institute data received:', instituteData);

      // Set streams state first
      if (instituteData?.streams) {
        setSelectedStreams(Array.isArray(instituteData.streams) ? instituteData.streams : []);
      }

      // Set location display values
      if (instituteData?.country) {
        setInitialCountryName(instituteData.country.name);
        form.setValue("country", instituteData.country.id);
      }

      if (instituteData?.state) {
        setInitialStateName(instituteData.state.name);
        form.setValue("state", instituteData.state.id);
      }

      if (instituteData?.city) {
        setInitialCityName(instituteData.city.name);
        form.setValue("city", instituteData.city.id);
      }

      // Reset form with all values from API
      form.reset({
        instituteName: instituteData.instituteName || '',
        institutePhone: instituteData.institutePhone || '',
        email: instituteData.email || '',
        establishedYear: instituteData.establishedYear || '',
        organisationType: instituteData.organisationType || '',
        website: instituteData.website || '',
        country: instituteData.country?.id || '',
        city: instituteData.city?.id || '',
        state: instituteData.state?.id || '',
        address: instituteData.address || '',
        // about: instituteData.about || '',
        minFees: instituteData.minFees || '',
        maxFees: instituteData.maxFees || '',
        affiliation: instituteData.affiliation || '',
        highestPackage: instituteData.highestPackage || '',
        streams: instituteData.streams || [],
        specialization: instituteData.specialization || '',
        thumbnail: instituteData.thumbnailImage,
        cover: instituteData.coverImage,
        logo: instituteData.instituteLogo,
        brochure: instituteData.brochure,
        examAccepted: instituteData.examAccepted || '',
        rank: instituteData.rank || ''
      });

      // Update preview URLs with proper null handling
      setPreviewThumbnailUrl(instituteData.thumbnailImage && instituteData.thumbnailImage !== "null"
        ? `${baseURL}/${instituteData.thumbnailImage}` : null);
      setPreviewCoverUrl(instituteData.coverImage && instituteData.coverImage !== "null"
        ? `${baseURL}/${instituteData.coverImage}` : null);
      setPreviewLogoUrl(instituteData.instituteLogo && instituteData.instituteLogo !== "null"
        ? `${baseURL}/${instituteData.instituteLogo}` : null);
      setPreviewbrochure(instituteData.brochure && instituteData.brochure !== "null"
        ? `${baseURL}/${instituteData.brochure}` : null);

      console.log('Form values after reset:', form.getValues());
    } catch (error) {
      console.error('Error fetching institute:', error);
      toast.error('Failed to load institute data');
    }
  };



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instituteName: '',
      institutePhone: '',
      email: '',
      establishedYear: '',
      website: '',
      organisationType: '',
      country: '',
      city: '',
      state: '',
      address: '',
      // about: '',
      minFees: '',
      maxFees: '',
      affiliation: '',
      highestPackage: '',
      streams: [],
      specialization: '',
      examAccepted: ''
    }
  });

  // Make sure to call fetch on component mount if we're in edit mode
  useEffect(() => {
    if (segments.length === 5 && segments[3] === 'update') {
      setIsEdit(true);
      fetchInstituteData();
    }
  }, []);


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(Object.keys(form.formState.errors))
    console.log('hi')
    if (Object.keys(form.formState.errors).length > 0) {
      toast.error('Please correct the errors in the form before submitting.');
      return;
    }
    const formData = new FormData();
    formData.append('instituteName', values.instituteName);
    formData.append('institutePhone', values.institutePhone);
    if (values.rank) {
      formData.append('rank', values.rank);
    }
    formData.append('email', values.email);
    if (values.establishedYear) {
      formData.append('establishedYear', values.establishedYear);
    }
    formData.append('organisationType', values.organisationType);
    formData.append('website', values.website);

    formData.append('address', values.address);
    // formData.append('about', values.about);
    formData.append('minFees', values.minFees);
    formData.append('maxFees', values.maxFees);
    formData.append('affiliation', values.affiliation);
    formData.append('highestPackage', values.highestPackage);
    formData.append('streams', values.streams);
    formData.append('specialization', values.specialization);
    formData.append('examAccepted', values.examAccepted);
    formData.append('thumbnailImage', values.thumbnail == null ? 'null' : (values.thumbnail || ''));
    formData.append('coverImage', values.cover == null ? 'null' : (values.cover || ''));
    formData.append('instituteLogo', values.logo == null ? 'null' : (values.logo || ''));
    formData.append('brochure', values.brochure == null ? 'null' : (values.brochure || ''));

    if (values.country) {
      const selectedCountry = countries.find(country => country.id.toString() === values.country.toString());
      if (selectedCountry) {
        formData.append('country[name]', selectedCountry.name);
        formData.append('country[iso2]', selectedCountry.iso2);
      }
    }

    if (values.state) {
      const selectedState = states.find(state => state.id.toString() === values.state.toString());
      if (selectedState) {
        formData.append('state[name]', selectedState.name);
        formData.append('state[iso2]', selectedState.iso2);
      }
    }

    if (values.city) {
      const selectedCity = cities.find(city => city.id.toString() === values.city.toString());
      if (selectedCity) {
        formData.append('city[name]', selectedCity.name);
      }
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



  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axiosInstance.get(`${apiUrl}/countries`);
        setCountries(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };

    fetchCountries();
  }, [apiUrl]);

  // Fetch States when the selected country changes
  useEffect(() => {
    const selectedCountryId = form.watch("country");

    if (!selectedCountryId || countries.length === 0) return;

    console.log("Fetching states for country:", selectedCountryId);

    const fetchStates = async () => {
      try {
        const selectedCountry = countries.find(
          (country: any) => country.id.toString() === selectedCountryId.toString()
        );

        if (selectedCountry) {
          const res = await axiosInstance.post(`${apiUrl}/states-by-country`, {
            countryCode: selectedCountry.iso2,
          });

          setStates(res.data?.data || []);
          setStatesLoaded(true);
          form.setValue("state", ""); // Reset state when country changes
          form.setValue("city", ""); // Reset city when country changes
        }
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };

    fetchStates();
  }, [form.watch("country"), countries, apiUrl]);

  // Fetch Cities when the selected state changes
  useEffect(() => {
    const selectedStateId = form.watch("state");
    const selectedCountryId = form.watch("country");

    if (!selectedStateId || !selectedCountryId) {
      setCities([]);
      setCitiesLoaded(false);
      return;
    }

    console.log("Fetching cities for state:", selectedStateId);

    const fetchCities = async () => {
      try {
        const selectedCountry = countries.find(
          (country) => country.id.toString() === selectedCountryId.toString()
        );
        const selectedState = states.find(
          (state) => state.id.toString() === selectedStateId.toString()
        );

        if (selectedCountry && selectedState) {
          const res = await axiosInstance.post(`${apiUrl}/cities-by-state`, {
            countryCode: selectedCountry.iso2,
            stateCode: selectedState.iso2,
          });

          setCities(res.data?.data || []);
          setCitiesLoaded(true);
          form.setValue("city", ""); // Reset city when state changes
        }
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      }
    };

    fetchCities();
  }, [form.watch("state"), form.watch("country"), states, countries, apiUrl]);


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
    form.setValue('thumbnail', null);
    if (fileInputThumbnailRef.current) {
      fileInputThumbnailRef.current.value = ''; // Reset the file input
    }
  };

  const removeCoverImage = () => {
    setPreviewCoverUrl(null);
    form.setValue('cover', null);
    if (fileInputCoverRef.current) {
      fileInputCoverRef.current.value = ''; // Reset the file input
    }
  };

  const removeLogo = () => {
    setPreviewLogoUrl(null);
    form.setValue('logo', null);
    if (fileInputLogoRef.current) {
      fileInputLogoRef.current.value = ''; // Reset the file input
    }
  };

  const removeBrochure = () => {
    setPreviewbrochure(null);
    form.setValue('brochure', null);
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={(value) => {

                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country">
                            {countries.find((c) => c.id == field.value)?.name || initialCountryName || ""}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />



              {/* State Select */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={(value) => {

                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State">
                            {states.find((c) => c.id == field.value)?.name || initialStateName || ""}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City Select */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={(value) => {

                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" >
                            {cities.find((c) => c.id == field.value)?.name || initialCityName || ""}
                          </SelectValue>

                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
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
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Rank" {...field} />
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

            {/* <FormField
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
            /> */}

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
                    <FormLabel>Thumbnail Image (Recommended size: 446px x 290px)</FormLabel>
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
                    <FormLabel>Cover Image  (Recommended size: 1414px x 400px) </FormLabel>
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
                  <FormLabel>Brochure (Recommended size: 1414px x 400px)</FormLabel>
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

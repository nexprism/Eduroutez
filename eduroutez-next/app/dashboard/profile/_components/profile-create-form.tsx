'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
// import { profileSchema, type ProfileFormValues } from '@/lib/form-schema';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { AlertTriangleIcon, Trash, Trash2Icon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
// import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import * as z from 'zod';

export const profileSchema = z.object({
  firstname: z
    .string()
    .min(3, { message: ' firstName must be at least 3 characters' }),
  lastname: z
    .string()
    .min(3, { message: ' lastName must be at least 3 characters' }),
  category: z
    .string(),
  bankName: z.string().min(3, { message: 'Account Name characters' }),
  accountNumber: z.string().min(10, { message: 'Account Number must be at least 10 characters' }), // Add this line
  accountHolderName: z.string().min(3, { message: 'Account Holder Name must be at least 3 characters' }), // Add this line
  ifscCode: z
    .string()
    .min(3, { message: 'Product Name must be at least 3 characters' }),
  email: z
    .string()
    .email({ message: 'Product Name must be at least 3 characters' }),
  instituteEmail: z
    .string(),
  contactno: z.coerce.number(),
  language:z.string(),
  ExperienceYear:z.string(),
  country: z.string().min(1, { message: 'Please select a category' }),
  city: z.string().min(1, { message: 'Please select a category' }),
  gender: z.string(),
  dateOfBirth: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Start date should be in the format YYYY-MM-DD'
  }),
  panCard: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, {
      message: 'Image size must be less than 1 MB.'
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
      }
    ),
  adharCard: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, {
      message: 'Image size must be less than 1 MB.'
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
      }
    ),
  profilePhoto: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1024 * 1024, {
      message: 'Image size must be less than 1 MB.'
    })
    .refine(
      (file) =>
        !file || ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      {
        message: 'Invalid image format. Only PNG, JPEG, and WEBP are allowed.'
      }
    ),
  experiences: z.array(
    z.object({
      title: z.string().min(1, { message: 'Please enter title' }),
      employmentType: z
        .string()
        .min(1, { message: 'Please enter employment type' }),
      location: z.string().optional(),
      companyName: z
        .string()
        .min(3, { message: 'Product Name must be at least 3 characters' }),
      description: z.string().optional(),
      startdate: z
        .string()
        .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
          message: 'Start date should be in the format YYYY-MM-DD'
        }),
      enddate: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: 'End date should be in the format YYYY-MM-DD'
      })
    })
  )
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormType {
  initialData: any | null;
  categories: any;
}
const ProfileCreateForm: React.FC<ProfileFormType> = ({
  initialData,
  categories
}) => {
  const [streamCategories, setStreamCategories] = useState<any[]>([]);
  const [, setOpen] = useState(false);
  const [loading] = useState(false);
  // const [imgLoading, setImgLoading] = useState(false);
  const title = initialData ? 'Edit product' : 'Create Your Profile';
  const description = initialData
    ? 'Edit a product.'
    : 'To create your resume, we first need some basic information about you.';
  // const toastMessage = initialData ? 'Product updated.' : 'Product created.';
  // const action = initialData ? 'Save changes' : 'Create';
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputPanCardRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputAdharCardRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputProfilePhotoRef = React.useRef<HTMLInputElement | null>(null);
  const [previewPanCardUrl, setPreviewPanCardUrl] = React.useState<
    string | null
  >(null);
  const [previewAdharCardUrl, setPreviewAdharCardUrl] = React.useState<
    string | null
  >(null);
  const [previewProfilePhotoUrl, setPreviewProfilePhotoUrl] = React.useState<
    string | null
  >(null);
  const [data, setData] = useState({});
  const [isEdit, setIsEdit] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const delta = currentStep - previousStep;

  const defaultValues = {
    email:localStorage.getItem('email') || '',
    experiences: [
      {
        title: '',
        employmentType: '',
        startdate: '',
        enddate: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    accountNumber: '', // Add this line
    accountHolderName: '', // Add this line
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onChange'
  });

  const {
    control,
    formState: { errors }
  } = form;

  const { append, remove, fields } = useFieldArray({
    control,
    name: 'experiences'
  });

  const processForm: SubmitHandler<ProfileFormValues> = (data) => {
    setData(data);
    // api call and reset
    // form.reset();
  };

  type FieldName = keyof ProfileFormValues;

  const steps = [
    {
      id: 'Step 1',
      name: 'Personal Information',
      fields: [
        'firstname',
        'lastname',
        'email',
        'contactno',
        'country',
        'city',
        'gender',
        'dateOfBirth',
        'language',
        'ExpereinceYear'
      ]
    },
    {
      id: 'Step 2',
      name: 'Professional Information',
      fields: fields
        ?.map((_, index) => [
          `experiences.${index}.title`,
          `experiences.${index}.companyName`,
          `experiences.${index}.startdate`,
          `experiences.${index}.enddate`,
          `experiences.${index}.location`
          // Add other field names as needed
        ])
        .flat()
    },
    {
      id: 'Step 3',
      name: 'Upload Documents',
      fields: ['panCard', 'adharCard', 'markSheet']
    },
    {
      id: 'Step 4',
      name: 'Bank Details',
      fields: ['bankName', 'accountNumber', 'accountHolderName', 'ifscCode']
    },
    { id: 'Step 5', name: 'Complete', fields: [] }
  ];

  const next = async () => {
    const fields = steps[currentStep].fields;

    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true
    });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await form.handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  function onSubmit(values: ProfileFormValues) {
    try {
      const formData = new FormData();
      formData.append('firstname', values.firstname);
      formData.append('lastname', values.lastname);
      formData.append('email', values.email);
      formData.append('contactno', values.contactno.toString());
      formData.append('country', values.country);
      formData.append('city', values.city);
      formData.append('gender', values.gender);
      formData.append('dateOfBirth', values.dateOfBirth);
      formData.append('category', values.category);
      formData.append('instituteEmail', values.instituteEmail);
      formData.append('language', values.language);
      formData.append('ExperienceYear', values.ExperienceYear);
      values.experiences.forEach((exp, index) => {
        formData.append(`experiences[${index}][title]`, exp.title);
        formData.append(`experiences[${index}][employmentType]`, exp.employmentType);
        formData.append(`experiences[${index}][startdate]`, exp.startdate);
        formData.append(`experiences[${index}][enddate]`, exp.enddate);
        formData.append(`experiences[${index}][location]`, exp.location || '');
        formData.append(`experiences[${index}][description]`, exp.description || '');
        formData.append(`experiences[${index}][companyName]`, exp.companyName);
      });
      if (values.panCard) {
        formData.append('panCard', values.panCard);
      }
      if (values.adharCard) {
        formData.append('adharCard', values.adharCard);
      }
      if (values.profilePhoto) {
        formData.append('profilePhoto', values.profilePhoto);
      }
      formData.append('bankName', values.bankName);
      formData.append('accountNumber', values.accountNumber); // Add this line
      formData.append('accountHolderName', values.accountHolderName); // Add this line
      formData.append('ifscCode', values.ifscCode);
      // console.log(formData);
      console.log('hi');
      console.log(values);
      mutate(formData);
    } catch (error) {}
  }

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      const Institute=localStorage.getItem('instituteId') || '';
      const endpoint =`${apiUrl}/counselor/${Institute}`; 
      const response = await axiosInstance({
        url: `${endpoint}`,
        method:'patch',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },

    onSuccess: () => {
      const message = isEdit
        ? 'Profile updated successfully'
        : 'Profile created successfully';
      toast.success(message);
      form.reset();

      router.push('/dashboard/profile');
    },
    onError: () => {
      toast.error('Something went wrong');
    }
  });


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`${apiUrl}/streams`);
        setStreamCategories(response.data.data.result|| []);
      } catch (error) {
        console.error('Failed to fetch stream categories', error);
        // Optionally show a toast error
        toast.error('Unable to load categories');
      }
    };

    fetchCategories();
  }, []);


  const handlePanCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPanCardUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('panCard', file);
    } else {
      setPreviewPanCardUrl(null);
      form.setValue('panCard', undefined);
    }
  };

  const triggerPanCardFileInput = () => {
    fileInputPanCardRef.current?.click();
  };

  const removePanCard = () => {
    setPreviewPanCardUrl(null);
    form.setValue('panCard', undefined);
    if (fileInputPanCardRef.current) {
      fileInputPanCardRef.current.value = ''; // Reset the file input
    }
  };

  const handleAdharCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAdharCardUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('adharCard', file);
    } else {
      setPreviewAdharCardUrl(null);
      form.setValue('adharCard', undefined);
    }
  };

  const triggerAdharCardFileInput = () => {
    fileInputAdharCardRef.current?.click();
  };

  const removeAdharCard = () => {
    setPreviewAdharCardUrl(null);
    form.setValue('adharCard', undefined);
    if (fileInputAdharCardRef.current) {
      fileInputAdharCardRef.current.value = ''; // Reset the file input
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfilePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('profilePhoto', file);
    } else {
      setPreviewProfilePhotoUrl(null);
      form.setValue('profilePhoto', undefined);
    }
  };

  const triggerProfilePhotoFileInput = () => {
    fileInputProfilePhotoRef.current?.click();
  };

  const removeProfilePhoto = () => {
    setPreviewProfilePhotoUrl(null);
    form.setValue('profilePhoto', undefined);
    if (fileInputProfilePhotoRef.current) {
      fileInputProfilePhotoRef.current.value = ''; // Reset the file input
    }
  };

  // const countries = [{ id: 'wow', name: 'india' }];
  // const cities = [{ id: '2', name: 'kerala' }];
  const gender = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'other', name: 'Other' }

  ];

  const { data: counselor } = useQuery({
    queryKey: ['answer'],
    queryFn: async () => {
      const email =localStorage.getItem('email') ;
      console.log('hi',email);
      const response = await axiosInstance.get(`${apiUrl}/counselor/${email}`);
      // console.log(response.data);
      return response.data;
    },
  // Only fetch when in edit mode
  });
  const IMAGE_URL = process.env.NEXT_PUBLIC_NEW_IMAGES;


  React.useEffect(() => {
    if (counselor?.data) {
      form.reset({
        firstname: counselor.data[0]?.firstname,
        lastname: counselor.data[0]?.lastname,
        email: counselor.data[0]?.email,
        contactno: counselor.data[0]?.contactno,
        country: counselor.data[0]?.country,
        category: counselor.data[0]?.category,
        instituteEmail: counselor.data[0]?.instituteEmail,
        city: counselor.data[0]?.city,
        gender: counselor.data[0]?.gender,
        dateOfBirth: counselor.data[0]?.dateOfBirth?.split('T')[0] || '', // Format date
        experiences: counselor.data[0]?.experiences || [],
        bankName: counselor.data[0]?.bankName,
        accountNumber: counselor.data[0]?.accountNumber, // Add this line
        accountHolderName: counselor.data[0]?.accountHolderName, // Add this line
        ifscCode: counselor.data[0]?.ifscCode,
        language: counselor.data[0]?.language,
        ExperienceYear: counselor.data[0]?.ExperienceYear
      });
      if (counselor.data[0].panCard) {
        const panCardFileName = counselor.data[0].panCard.split('\\').pop()?.split('/').pop();
        setPreviewPanCardUrl(`${IMAGE_URL}/${panCardFileName}`);
      }
      if (counselor.data[0].adharCard) {
        const adharCardFileName = counselor.data[0]?.adharCard.split('\\').pop()?.split('/').pop();
        setPreviewAdharCardUrl(`${IMAGE_URL}/${adharCardFileName}`);
      }
      if (counselor.data[0].profilePhoto) {
        const profilePhoto = counselor.data[0]?.profilePhoto.split('\\').pop()?.split('/').pop();
        setPreviewProfilePhotoUrl(`${IMAGE_URL}/${profilePhoto}`);
      }
      // console.log(datOfBirth);
    }
  }, [counselor, form]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <div>
        <ul className="flex gap-4">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-sky-600 transition-colors ">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex h-full w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            if (Object.keys(errors).length > 0) {
              console.log('hi2');
              console.log(errors);
              console.log(form);
              toast.error(
                'Please correct the errors in the form before submitting.'
              );
            }
          })}
          className="w-full space-y-8"
        >
          <div
            className={cn(
              currentStep === 1
                ? 'w-full md:inline-block'
                : 'gap-8 md:grid md:grid-cols-3'
            )}
          >
            {currentStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="John"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Doe"
                          {...field}
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
                        <Input
                          disabled
                          defaultValue={
                            typeof window !== 'undefined'
                              ? localStorage.getItem('email') || ''
                              : ''
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter you contact number"
                          disabled={loading}
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Select Country"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language You Know</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Language(comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ExperienceYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ExperienceYear</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="ExperienceYear"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Gender"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore  */}
                          {gender.map((country) => (
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

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={loading} {...field} />
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
                        <Input
                          disabled={loading}
                          placeholder="Your City"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
                 <FormField
    control={form.control}
    name="category"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Category</FormLabel>
        <Select
          disabled={loading}
          onValueChange={field.onChange}
          value={field.value}
          defaultValue={field.value}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue
                defaultValue={field.value}
                placeholder="Select Category"
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {streamCategories?.map((category) => (
              <SelectItem 
                key={category?._id ?? ''} 
                value={category?.name ?? ''}
              >
                {category?.name ?? 'Unknown'}
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
                  name="instituteEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institute Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="N/A if not available"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {currentStep === 1 && (
              <>
                {fields?.map((field, index) => (
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="item-1"
                    key={field.id}
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger
                        className={cn(
                          'relative !no-underline [&[data-state=closed]>button]:hidden [&[data-state=open]>.alert]:hidden',
                          errors?.experiences?.[index] && 'text-red-700'
                        )}
                      >
                        {`Work Experience ${index + 1}`}

                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-8"
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="h-4 w-4 " />
                        </Button>
                        {errors?.experiences?.[index] && (
                          <span className="alert absolute right-8">
                            <AlertTriangleIcon className="h-4 w-4   text-red-700" />
                          </span>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div
                          className={cn(
                            'relative mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-3'
                          )}
                        >
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job title</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.companyName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.employmentType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employment Type</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.startdate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experiences.${index}.enddate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    disabled={loading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`experiences.${index}.location`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={loading}
                                    placeholder="Country"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}

                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    className="flex justify-center"
                    size={'lg'}
                    onClick={() =>
                      append({
                        title: '',
                        employmentType: '',
                        companyName: '',
                        startdate: '',
                        enddate: '',
                        location: '',
                        description: ''
                      })
                    }
                  >
                    Add More
                  </Button>
                </div>
              </>
            )}
          </div>
          {currentStep === 2 && (
            <div className="grid w-full grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="panCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pan Card</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handlePanCardChange}
                          ref={fileInputPanCardRef}
                          className="hidden"
                        />
                        {previewPanCardUrl ? (
                          <div className="relative">
                            <Image
                              src={previewPanCardUrl}
                              alt="Preview"
                              className="w-full h-full rounded-md object-cover"
                              width={1200}
                              height={400}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removePanCard}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerPanCardFileInput}
                            className="border-grey-300 flex h-[400px] w-full cursor-pointer items-center justify-center rounded-md border"
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
                name="adharCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adhar Card</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleAdharCardChange}
                          ref={fileInputAdharCardRef}
                          className="hidden"
                        />
                        {previewAdharCardUrl ? (
                          <div className="relative">
                            <Image
                              src={previewAdharCardUrl}
                              alt="Preview"
                              className="max-h-[400px] max-w-full rounded-md object-cover"
                              width={1200}
                              height={400}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removeAdharCard}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerAdharCardFileInput}
                            className="border-grey-300 flex h-[400px] w-full cursor-pointer items-center justify-center rounded-md border"
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
                name="profilePhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ProfilePhoto</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleProfilePhotoChange}
                          ref={fileInputProfilePhotoRef}
                          className="hidden"
                        />
                        {previewProfilePhotoUrl ? (
                          <div className="relative">
                            <Image
                              src={previewProfilePhotoUrl}
                              alt="Preview"
                              className="w-full h-full rounded-md object-cover"
                              width={1200}
                              height={400}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-0 top-0 -mr-2 -mt-2"
                              onClick={removeProfilePhoto}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={triggerProfilePhotoFileInput}
                            className="border-grey-300 flex h-[400px] w-full cursor-pointer items-center justify-center rounded-md border"
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
          )}
          {currentStep === 3 && (
            <>
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={loading}
                        placeholder="Enter your bank name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={loading}
                        placeholder="Enter your account number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={loading}
                        placeholder="Enter account holder name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={loading}
                        placeholder="Enter your IFSC code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {currentStep === 4 && (
            <div>
                <div className="text-center">
                <h1 className="text-2xl font-bold">Profile Completed</h1>
                <p className="mt-4 text-lg">Here is the summary of your profile:</p>
                <pre className="mt-4 whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-left">
                  {JSON.stringify(data, null, 2)}
                </pre>
                </div>
            </div>
          )}
          {currentStep === 4 && (
            <Button disabled={loading} className="ml-auto" type="submit">
              Submit
            </Button>
          )}
        </form>
      </Form>
      {/* Navigation */}
      <div className="mt-8 pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileCreateForm;

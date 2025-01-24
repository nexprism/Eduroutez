import CustomEditor from '@/components/custom-editor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Button } from 'react-day-picker';
import { Form, Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
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
  organisationType: z.string({
    required_error: 'Please select an organization type.'
  }),
  brochure: z.any().optional(),
  pictures: z.array(z.any())
});

const CollegeInfo = () => {
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
      // organisationType: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {}
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Institute Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
  );
};

export default CollegeInfo;

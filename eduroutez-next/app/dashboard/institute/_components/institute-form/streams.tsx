import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

import React from 'react';
import { Button } from '@/components/ui/button'; // Corrected Button import
import { Form, useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema definition using Zod
const formSchema = z.object({
  about: z
    .string()
    .min(1, { message: 'Please enter your skills.' })
    .optional() // Marked optional to match behavior
});

const Skills = () => {
  // Hook Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  // Submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form Values:', values); // Placeholder for form submission logic
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add skills like -> designing, developing, marketing"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Save & Update</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Skills;

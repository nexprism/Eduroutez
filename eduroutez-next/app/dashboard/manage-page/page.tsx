'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

type FormData = {
  title: string;
  status: string;
  image: FileList;
  content: string;
};

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }); // Disable SSR for ReactQuill

const ManagePage: React.FC = () => {
  const { register, handleSubmit, control } = useForm<FormData>();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('status', data.status);
    formData.append('image', data.image[0]);
    formData.append('description', data.content);

    const response = await axiosInstance(`${apiUrl}/page`, {
      method: 'POST',
      data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response) {
        toast.success('Page created successfully');
      console.log('Page created successfully');
    } else {
      console.error('Failed to create page');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Create New Page</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-lg font-medium text-gray-700">Status</label>
            <select
              id="status"
              {...register('status', { required: 'Status is required' })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Active</option>
              <option value="published">InActive</option>
            </select>
          </div>

          {/* Image Upload Field */}
          <div>
            <label htmlFor="image" className="block text-lg font-medium text-gray-700">Image</label>
            <input
              id="image"
              type="file"
              {...register('image', { required: 'Image is required' })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700">Content</label>
            <Controller
              name="content"
              control={control}
              defaultValue=""
              render={({ field }) => <ReactQuill {...field} />}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagePage;

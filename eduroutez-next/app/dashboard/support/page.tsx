'use client'
import React, { useState } from 'react';
import { 
  MessageCircle, 
  LifeBuoy, 
  Clock, 
  Phone,
  Mail,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

const SupportPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();



    const formData = new FormData();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const instituteId = localStorage.getItem('instituteId');
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }
    if (instituteId) {
      formData.append('instituteId', instituteId);
    }

    try {
      const response = await axiosInstance(`${apiUrl}/submitIssue`, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response) {
        throw new Error('Network response was not ok');
      }

      const result = response.data;
      toast.success('Issue submitted successfully');
      console.log('Issue submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error('Error submitting issue');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How can we help you?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our support team is here to assist you. Submit a request or use our quick help options.
        </p>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section - Left Side */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                <h2 className="text-2xl font-bold text-white">Submit a Support Request</h2>
                <p className="text-purple-100 mt-2">We&apos;ll get back to you as soon as possible.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief summary of your issue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                    >
                      Choose File
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      or drag and drop files here
                    </p>
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Links Section - Right Side */}
          <div className="lg:w-1/3 space-y-6">
            {/* Contact Support */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Phone className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="text-gray-600">Available 24/7</p>
              <p className="text-purple-600 font-semibold">+1 (555) 123-4567</p>
            </div>
            
            {/* Email Support */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Mail className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600">Response within 24 hours</p>
              <p className="text-purple-600 font-semibold">support@example.com</p>
            </div>
            
            {/* FAQs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <FileQuestion className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">FAQs</h3>
              <p className="text-gray-600">Quick answers to common questions</p>
              <button className="text-purple-600 font-semibold">View FAQs →</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
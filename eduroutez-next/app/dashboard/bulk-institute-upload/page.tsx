'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const BulkInstituteUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          selectedFile.type !== 'text/csv') {
        setMessage('Please upload only Excel or CSV files.');
        setStatus('error');
        return;
      }
      setFile(selectedFile);
      setMessage('');
      setStatus('idle');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please upload a file.');
      setStatus('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setStatus('loading');

    try {
      const response = await fetch(`${apiUrl}/bulkAddInstitutes`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setMessage(data.message);
      setStatus('success');
    } catch (error) {
      setMessage('Error uploading file. Please try again.');
      setStatus('error');
    } finally {
      setProgress(0);
    }
  };

  return (
    <Card className="w-full h-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Institute Upload
        </CardTitle>
        <CardDescription>
          Upload Excel or CSV files to add multiple institutes at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".xlsx,.csv"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
              >
                {file ? (
                  <div className="text-sm">
                    Selected file: <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 mb-2 text-gray-400" />
                    <span>Click to upload or drag and drop</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Excel or CSV files only
                    </p>
                  </div>
                )}
              </label>
            </div>

            {status === 'loading' && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-gray-600">Uploading...</p>
              </div>
            )}

            {message && (
              <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {status === 'error' ? 'Error' : 'Success'}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={!file || status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BulkInstituteUpload;
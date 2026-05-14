'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import WebinarPackageForm from './webinar-package-form';

interface WebinarPackageViewPageProps {
  params: {
    slug: string[];
  };
}

export default function WebinarPackageViewPage({
  params
}: WebinarPackageViewPageProps) {
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const action = params.slug[0];
  const packageId = params.slug[1];

  useEffect(() => {
    const fetchPackage = async () => {
      if (action === 'edit' && packageId) {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/webinar-package/${packageId}`);
          if (response.data.success) {
            setPkg(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching package:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [action, packageId]);

  if (action === 'create') {
    return <WebinarPackageForm />;
  }

  if (action === 'edit') {
    if (loading) {
      return (
        <div className='flex justify-center items-center py-10'>
          <Loader className='h-6 w-6 animate-spin' />
        </div>
      );
    }

    return <WebinarPackageForm packageId={packageId} initialData={pkg} isEdit />;
  }

  // View mode
  if (loading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <Loader className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{pkg?.name}</h1>
        <p className='text-muted-foreground mt-2'>Package Details</p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Webinars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pkg?.webinarCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Sale Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>₹{pkg?.salePrice.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Status</CardTitle>
          </CardHeader>
          <CardContent className='pt-2'>
            <Badge variant={pkg?.isActive ? 'default' : 'secondary'}>
              {pkg?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {pkg?.description && (
            <div>
              <h3 className='font-semibold mb-2'>Description</h3>
              <p className='text-muted-foreground'>{pkg.description}</p>
            </div>
          )}

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <h3 className='font-semibold text-sm mb-2'>Original Price</h3>
              <p className='text-lg'>₹{pkg?.originalPrice.toLocaleString()}</p>
            </div>
            <div>
              <h3 className='font-semibold text-sm mb-2'>Discount Price</h3>
              <p className='text-lg'>₹{pkg?.discountPrice?.toLocaleString() || '-'}</p>
            </div>
            <div>
              <h3 className='font-semibold text-sm mb-2'>Sale Price</h3>
              <p className='text-lg font-semibold text-green-600'>₹{pkg?.salePrice.toLocaleString()}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h3 className='font-semibold text-sm mb-2'>Sale Start Date</h3>
              <p>{new Date(pkg?.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className='font-semibold text-sm mb-2'>Sale End Date</h3>
              <p>{new Date(pkg?.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          {pkg?.features && pkg.features.length > 0 && (
            <div>
              <h3 className='font-semibold mb-2'>Features</h3>
              <div className='flex flex-wrap gap-2'>
                {pkg.features.map((feature: string, index: number) => (
                  <Badge key={index}>{feature}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

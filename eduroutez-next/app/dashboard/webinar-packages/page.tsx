'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, ShoppingCart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WebinarPackage {
  _id: string;
  name: string;
  webinarCount: number;
  originalPrice: number;
  discountPrice?: number;
  salePrice: number;
  description: string;
  features: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  isSaleLive: boolean;
}

export default function BrowseWebinarPackages() {
  const [packages, setPackages] = useState<WebinarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/webinar-packages/active');
        if (response.data.success) {
          setPackages(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasingId(packageId);
      
      // Get the package details to pre-fill the purchase form
      const pkg = packages.find(p => p._id === packageId);
      if (!pkg) return;

      // Create initial purchase with pending status
      const purchaseData = {
        packageId,
        amountPaid: pkg.salePrice,
        expiryDate: pkg.endDate,
        paymentStatus: 'pending'
      };

      const response = await axiosInstance.post('/webinar-package/purchase', purchaseData);
      
      if (response.data.success) {
        const purchaseId = response.data.data._id;
        // Redirect to payment page
        router.push(`/dashboard/webinar-packages/purchase/${purchaseId}/payment`);
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Webinar Packages</h1>
        <p className='text-muted-foreground mt-2'>
          Browse and purchase webinar packages to enhance your institute
        </p>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>No packages available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {packages.map((pkg) => (
            <Card key={pkg._id} className='flex flex-col'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription className='mt-2 line-clamp-2'>
                      {pkg.description}
                    </CardDescription>
                  </div>
                  {pkg.isSaleLive && (
                    <Badge variant='destructive' className='ml-2'>
                      LIVE SALE
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='flex-1 space-y-6'>
                {/* Webinar Count */}
                <div>
                  <p className='text-sm text-muted-foreground'>Webinars Included</p>
                  <p className='text-2xl font-bold'>{pkg.webinarCount}</p>
                </div>

                {/* Pricing */}
                <div className='space-y-2'>
                  {pkg.discountPrice && (
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground line-through'>
                        ₹{pkg.originalPrice.toLocaleString()}
                      </span>
                      <span className='text-sm text-muted-foreground line-through'>
                        ₹{pkg.discountPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold text-green-600'>
                      ₹{pkg.salePrice.toLocaleString()}
                    </span>
                    {pkg.discountPrice && (
                      <span className='text-sm text-green-600'>
                        Save ₹{(pkg.originalPrice - pkg.salePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <div>
                    <p className='text-sm font-semibold mb-2'>Includes:</p>
                    <ul className='space-y-1'>
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className='text-sm flex items-center gap-2'>
                          <Check className='h-4 w-4 text-green-600' />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Validity */}
                <div className='pt-2 border-t'>
                  <p className='text-xs text-muted-foreground'>
                    Valid until {new Date(pkg.endDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pkg._id)}
                  disabled={purchasingId === pkg._id}
                  className='w-full gap-2'
                >
                  {purchasingId === pkg._id ? (
                    <>
                      <Loader className='h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className='h-4 w-4' />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

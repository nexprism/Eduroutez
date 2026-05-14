'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import CellAction from './cell-action';
import { Loader } from 'lucide-react';

interface WebinarPackage {
  _id: string;
  name: string;
  webinarCount: number;
  originalPrice: number;
  salePrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isSaleLive: boolean;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function WebinarPackageTable() {
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<WebinarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  const page = searchParams.get('page') || '1';

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/webinar-packages', {
          params: {
            page: page,
            limit: 10
          }
        });

        if (response.data.success) {
          setPackages(response.data.data.data || []);
          setPagination(response.data.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching webinar packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [page]);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <Loader className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead>Package Name</TableHead>
              <TableHead>Webinars</TableHead>
              <TableHead>Original Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Sale Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  No webinar packages found
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg._id} className='hover:bg-muted/50'>
                  <TableCell className='font-medium'>{pkg.name}</TableCell>
                  <TableCell>{pkg.webinarCount}</TableCell>
                  <TableCell>₹{pkg.originalPrice.toLocaleString()}</TableCell>
                  <TableCell className='font-semibold text-green-600'>
                    ₹{pkg.salePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-sm'>
                    {new Date(pkg.startDate).toLocaleDateString()} - {new Date(pkg.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      {pkg.isActive ? (
                        <Badge variant='default' className='bg-green-600'>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant='secondary'>Inactive</Badge>
                      )}
                      {pkg.isSaleLive && (
                        <Badge variant='destructive'>Live Sale</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <CellAction data={pkg} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className='flex justify-center'>
          <Pagination>
            <PaginationContent>
              {pagination.page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`?page=${pagination.page - 1}`} />
                </PaginationItem>
              )}

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href={`?page=${p}`}
                    isActive={p === pagination.page}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {pagination.page < pagination.pages && (
                <PaginationItem>
                  <PaginationNext href={`?page=${pagination.page + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

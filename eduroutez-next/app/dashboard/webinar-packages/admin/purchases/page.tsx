'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Loader, Eye, Download } from 'lucide-react';

interface Purchase {
  _id: string;
  instituteId: {
    _id: string;
    name: string;
    email: string;
  };
  packageId: {
    _id: string;
    name: string;
    webinarCount: number;
  };
  amountPaid: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  usedWebinars: number;
  webinarLimit: number;
  purchasedAt: string;
  expiryDate: string;
  isExpired: boolean;
  usagePercentage: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export default function PurchasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  const [filters, setFilters] = useState({
    paymentStatus: searchParams.get('status') || '',
    search: searchParams.get('search') || ''
  });

  const page = parseInt(searchParams.get('page') || '1');

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: pagination.limit
      };

      if (filters.paymentStatus) {
        params.paymentStatus = filters.paymentStatus;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await axiosInstance.get('/webinar-purchases', { params });

      if (response.data.success) {
        setPurchases(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    router.push(`/dashboard/webinar-packages/admin/purchases?page=1`);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Institute', 'Package', 'Amount', 'Status', 'Used/Total', 'Purchased', 'Expires'];
    const rows = purchases.map(p => [
      p.instituteId.name,
      p.packageId.name,
      p.amountPaid,
      p.paymentStatus,
      `${p.usedWebinars}/${p.webinarLimit}`,
      new Date(p.purchasedAt).toLocaleDateString(),
      new Date(p.expiryDate).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webinar-purchases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Webinar Purchase Orders</h1>
        <p className='text-muted-foreground mt-2'>Manage and track all webinar package purchases</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={e => handleFilterChange('paymentStatus', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>All Statuses</option>
                <option value='pending'>Pending</option>
                <option value='completed'>Completed</option>
                <option value='failed'>Failed</option>
                <option value='refunded'>Refunded</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Search</label>
              <input
                type='text'
                placeholder='Search by institute or package name...'
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleExportCSV} variant='outline' className='gap-2'>
              <Download className='h-4 w-4' />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Total: {pagination.total} purchases</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-20'>
              <Loader className='h-8 w-8 animate-spin' />
            </div>
          ) : purchases.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-muted-foreground'>No purchases found</p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institute</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Purchased</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map(purchase => (
                      <TableRow key={purchase._id}>
                        <TableCell className='font-medium'>
                          <div>
                            <p>{purchase.instituteId.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              {purchase.instituteId.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.packageId.name}</TableCell>
                        <TableCell className='font-semibold'>
                          ₹{purchase.amountPaid.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentStatusColors[purchase.paymentStatus]}>
                            {purchase.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <p className='font-medium'>
                              {purchase.usedWebinars}/{purchase.webinarLimit}
                            </p>
                            <p className='text-muted-foreground'>
                              {Math.round(purchase.usagePercentage)}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <span>{new Date(purchase.expiryDate).toLocaleDateString()}</span>
                            {purchase.isExpired && (
                              <Badge variant='destructive'>Expired</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              router.push(
                                `/dashboard/webinar-packages/purchase/${purchase._id}`
                              )
                            }
                            className='gap-1'
                          >
                            <Eye className='h-4 w-4' />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className='mt-6'>
                  <Pagination>
                    <PaginationContent>
                      {page > 1 && (
                        <PaginationPrevious
                          href={`?page=${page - 1}`}
                          className='cursor-pointer'
                        />
                      )}

                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                        pageNum => (
                          <PaginationLink
                            key={pageNum}
                            href={`?page=${pageNum}`}
                            isActive={pageNum === page}
                            className='cursor-pointer'
                          >
                            {pageNum}
                          </PaginationLink>
                        )
                      )}

                      {page < pagination.pages && (
                        <PaginationNext
                          href={`?page=${page + 1}`}
                          className='cursor-pointer'
                        />
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

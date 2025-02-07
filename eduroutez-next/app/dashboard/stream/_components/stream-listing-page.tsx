'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import StreamTable from './stream-tables';
import { useQuery } from '@tanstack/react-query';
import { useStreamTableFilters } from './stream-tables/use-stream-table-filters';
import axiosInstance from '@/lib/axios';
import { useState, useCallback, useEffect } from 'react';

type TStreamListingPage = {};

export default function StreamListingPage({}: TStreamListingPage) {
  const { searchQuery, page, limit } = useStreamTableFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['streams', searchQuery, page],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/streams`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    }
  });

  const filterData = useCallback((searchValue: string) => {
    if (!data?.data?.result) return [];
    
    try {
      const regex = new RegExp(searchValue, 'i');
      return data.data.result.filter((item: any) => {
        // Adjust these fields based on your stream object structure
        return regex.test(item.name) || 
               regex.test(item.description) || 
               regex.test(item.id);
      });
    } catch (error) {
      // Handle invalid regex
      console.error('Invalid regex pattern:', error);
      return data.data.result;
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      const filtered = filterData(searchTerm);
      setFilteredData(filtered);
    }
  }, [searchTerm, data, isSuccess, filterData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  function setPage(newPage: any) {
    throw new Error('Function not implemented.');
  }

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Stream (${data.data.totalDocuments})`}
                description="All streams online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/stream/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search streams..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <StreamTable
              data={filteredData}
              totalData={data?.data?.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}
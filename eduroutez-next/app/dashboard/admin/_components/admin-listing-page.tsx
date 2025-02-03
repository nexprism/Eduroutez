'use client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import AdminTable from './admin-tables';
import { useQuery } from '@tanstack/react-query';
import { useAdminTableFilters } from './admin-tables/use-admin-table-filters';
import axiosInstance from '@/lib/axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming Select component is imported from your UI components
import { useState, useEffect } from 'react';

type TAdminListingPage = {};

export default function AdminListingPage({}: TAdminListingPage) {
  const { searchQuery, page, limit } = useAdminTableFilters();
  const [roleFilter, setRoleFilter] = useState<string>(''); // State for the role filter
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([]); // State to hold filtered admin data
  const [allAdmins, setAllAdmins] = useState<any[]>([]); // State to hold all admins data

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['admins', searchQuery, page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/admins`, {
        params: {
          searchFields: JSON.stringify({}),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: 1, // Set page to 1 to fetch all docs
          limit: 1000000, // A large number to fetch all data
        },
      });
      return response.data;
    },
  });

  // Extract unique roles from the data for the dropdown
  const roles = Array.from(new Set(data?.data.result.map((admin: any) => admin.role))) || [];

  // Once data is fetched, set all admins and apply filtering
  useEffect(() => {
    if (data?.data.result) {
      setAllAdmins(data.data.result);
      if (roleFilter) {
        setFilteredAdmins(data.data.result.filter((admin: any) => admin.role === roleFilter));
      } else {
        setFilteredAdmins(data.data.result);
      }
    }
  }, [data, roleFilter]);

  // Handle pagination of filtered data client-side
  const startIdx = (page - 1) * limit;
  const paginatedAdmins = filteredAdmins.slice(startIdx, startIdx + limit);

  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`Users (${filteredAdmins.length})`} // Display total filtered count
                description="All admins online and offline are listed here."
              />
              <Button asChild className="w-fit whitespace-nowrap px-2">
                <Link href="/dashboard/admin/new">
                  <Plus className="mr-1 h-4 w-4" /> Add New
                </Link>
              </Button>
            </div>
            <Separator />

            {/* Role Filter Dropdown */}
            <div className="flex items-center space-x-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)} {/* Capitalize role */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AdminTable
              data={paginatedAdmins} // Use the paginated filtered data
              totalData={filteredAdmins.length} // Total count for filtered data
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

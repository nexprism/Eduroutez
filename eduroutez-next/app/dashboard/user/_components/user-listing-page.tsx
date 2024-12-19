'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import UserTable from './user-tables';
import { useQuery } from '@tanstack/react-query';

import { useUserTableFilters } from './user-tables/use-user-table-filters';
import axiosInstance from '@/lib/axios';

type TUserListingPage = {};

export default function UserListingPage({}: TUserListingPage) {
  // const queryClient = useQueryClient()
  const { searchQuery, page, limit } = useUserTableFilters();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/users`, {
        params: {
          searchFields: JSON.stringify({ name: searchQuery }),
          sort: JSON.stringify({ createdAt: 'desc' }),
          page: page,
          limit: limit
        }
      });
      return response.data;
    }
  });
  return (
    <PageContainer scrollable>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        isSuccess && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading
                title={`User (${data.data.totalDocuments})`}
                description="All app users, including normal users and business owners, and their roles are listed here."
              />
            </div>
            <Separator />
            <UserTable
              data={data.data.result}
              totalData={data.data.totalDocuments}
            />
          </div>
        )
      )}
    </PageContainer>
  );
}

'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import VerificationTable from './verification-tables';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export default function VerificationListingPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    const { data, isLoading, isSuccess, refetch } = useQuery({
        queryKey: ['counselor-verifications'],
        queryFn: async () => {
            const response = await axiosInstance.get(`${apiUrl}/counselor-test/pending-verifications`);
            return response.data?.data;
        },
        enabled: !!role && role === 'SUPER_ADMIN'
    });

    if (role !== 'SUPER_ADMIN') {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer scrollable>
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <p>Loading verifications...</p>
                </div>
            ) : (
                isSuccess && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <Heading
                                title={`Counselor Verifications (${data?.length || 0})`}
                                description="Review and verify counselors who have completed the certification test."
                            />
                        </div>
                        <Separator />
                        <VerificationTable data={data} refetch={refetch} />
                    </div>
                )
            )}
        </PageContainer>
    );
}

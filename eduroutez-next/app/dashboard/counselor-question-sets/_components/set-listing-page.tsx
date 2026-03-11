'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import QuestionSetTable from './set-tables';

export default function QuestionSetListingPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ['counselor-question-sets'],
        queryFn: async () => {
            const response = await axiosInstance.get(`${apiUrl}/question-sets`);
            return response.data?.data?.result || [];
        }
    });

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Question Sets (${data?.length || 0})`}
                        description="Manage the 50-question test sets for counselor certification."
                    />
                    <Button onClick={() => router.push('/dashboard/counselor-question-sets/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Set
                    </Button>
                </div>
                <Separator />
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    isSuccess && <QuestionSetTable data={data} />
                )}
            </div>
        </PageContainer>
    );
}

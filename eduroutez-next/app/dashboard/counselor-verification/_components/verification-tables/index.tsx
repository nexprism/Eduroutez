'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';

interface VerificationTableProps {
    data: any[];
    refetch: () => void;
}

export default function VerificationTable({ data }: VerificationTableProps) {
    return (
        <div className="space-y-4">
            <DataTable columns={columns} data={data || []} totalItems={data?.length || 0} />
        </div>
    );
}

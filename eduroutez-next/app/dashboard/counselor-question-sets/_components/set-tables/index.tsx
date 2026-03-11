'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';

export default function QuestionSetTable({ data }: { data: any[] }) {
    return (
        <DataTable columns={columns} data={data || []} totalItems={data?.length || 0} />
    );
}

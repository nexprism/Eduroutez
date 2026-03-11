'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'firstname',
        header: 'FIRST NAME'
    },
    {
        accessorKey: 'lastname',
        header: 'LAST NAME'
    },
    {
        accessorKey: 'email',
        header: 'EMAIL'
    },
    {
        accessorKey: 'testResult',
        header: 'TEST SCORE',
        cell: ({ row }) => {
            const testResult = row.original.testResult;
            return testResult ? `${testResult.score} / ${testResult.totalQuestions}` : 'N/A';
        }
    },
    {
        accessorKey: 'verificationStatus',
        header: 'STATUS',
        cell: ({ row }) => {
            const status = row.original.verificationStatus;
            return (
                <Badge variant={status === 'verified' ? 'default' : 'secondary'}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
];

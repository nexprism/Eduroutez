'use client';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'setName',
        header: 'SET NAME'
    },
    {
        accessorKey: 'totalQuestions',
        header: 'TOTAL QUESTIONS'
    },
    {
        accessorKey: 'timeLimit',
        header: 'TIME LIMIT (MIN)'
    },
    {
        accessorKey: 'createdAt',
        header: 'CREATED AT',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    }
];

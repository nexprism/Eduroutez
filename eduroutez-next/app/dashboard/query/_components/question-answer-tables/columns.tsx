'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Query, QuestionAnswer } from '@/types';

export const columns: ColumnDef<Query>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }) => <div>{typeof row.original.name === 'object' ? JSON.stringify(row.original.name) : String(row.original.name || '')}</div>,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: ({ row }) => <div>{typeof row.original.email === 'object' ? JSON.stringify(row.original.email) : String(row.original.email || '')}</div>,
  },
  {
    header: 'Phone No',
    accessorKey: 'phoneNo',
    cell: ({ row }) => <div>{typeof row.original.phoneNo === 'object' ? JSON.stringify(row.original.phoneNo) : String(row.original.phoneNo || '')}</div>,
  },
  {
    header: 'City',
    accessorKey: 'city',
    cell: ({ row }) => <div>{typeof row.original.city === 'object' ? (row.original.city as any)?.name : row.original.city}</div>,
  },
  {
    header: 'Query Related To',
    accessorKey: 'queryRelatedTo',
    cell: ({ row }) => <div>{String(row.original.queryRelatedTo || '')}</div>,
  },
  {
    header: 'Query',
    accessorKey: 'query',
    cell: ({ row }) => <div>{String(row.original.query || '')}</div>,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <div>{String(row.original.status || '')}</div>,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleString()}</div>,
  },
  {
    header: 'Updated At',
    accessorKey: 'updatedAt',
    cell: ({ row }) => <div>{new Date(row.original.updatedAt).toLocaleString()}</div>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

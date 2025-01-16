'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ManagePages } from '@/types';

export const columns: ColumnDef<ManagePages>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>, // Corrected formatting
  },
  {
    header: 'Title',
    accessorKey: 'question', // Simplified with accessorKey
    cell: ({ row }) => <div>{row.original.title}</div>,
  },
  {
    header: 'Description',
    accessorKey: 'answer', // Added accessorKey for consistency
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{ __html: row.original.description || '' }} // Fixed syntax
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={!row.original.status ? 'secondary' : 'default'}
          className="text-xs "
        >
          {row.original.status ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    )
  },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

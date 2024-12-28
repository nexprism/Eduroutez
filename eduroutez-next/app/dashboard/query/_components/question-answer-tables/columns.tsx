'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Query, QuestionAnswer } from '@/types';

export const columns: ColumnDef<Query>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>, // Corrected formatting
  },
  {
    header: 'Query',
    accessorKey: 'question', // Simplified with accessorKey
    cell: ({ row }) => <div>{row.original.queryRelatedTo}</div>,
  },
  {
    header: 'AskedBy',
    accessorKey: 'question', // Simplified with accessorKey
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

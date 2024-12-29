'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Answer, QuestionAnswer } from '@/types';

export const columns: ColumnDef<Answer>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>, // Corrected formatting
  },
  {
    header: 'Question',
    accessorKey: 'question', // Simplified with accessorKey
    cell: ({ row }) => <div>{row.original.question}</div>,
  },
  {
    header: 'Grade',
    accessorKey: 'answer', // Added accessorKey for consistency
    cell: ({ row }) => <div>{row.original.grade}</div> ,
  },
  {
    header: 'label',
    accessorKey: 'answer', // Added accessorKey for consistency
    cell: ({ row }) => <div>{row.original.label}</div> ,
  },
  {
    header: 'AskedBy',
    accessorKey: 'answer', // Added accessorKey for consistency
    cell: ({ row }) => <div>{row.original.askedBy}</div> ,
  },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

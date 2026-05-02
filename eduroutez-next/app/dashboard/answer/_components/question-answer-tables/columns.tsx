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
    accessorKey: 'grade',
    cell: ({ row }) => <div>{typeof row.original.grade === 'object' ? JSON.stringify(row.original.grade) : String(row.original.grade || '')}</div> ,
  },
  {
    header: 'Label',
    accessorKey: 'label',
    cell: ({ row }) => <div>{typeof row.original.label === 'object' ? JSON.stringify(row.original.label) : String(row.original.label || '')}</div> ,
  },
  {
    header: 'Asked By',
    accessorKey: 'askedBy',
    cell: ({ row }) => <div>{typeof row.original.askedBy === 'object' ? (row.original.askedBy as any)?.name : String(row.original.askedBy || '')}</div> ,
  },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

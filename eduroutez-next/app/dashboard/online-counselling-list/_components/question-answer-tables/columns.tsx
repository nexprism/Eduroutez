'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { QuestionAnswer } from '@/types';

export const columns: ColumnDef<QuestionAnswer>[] = [
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
    header: 'Answer',
    accessorKey: 'answer', // Added accessorKey for consistency
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{ __html: row.original.answer }} // Fixed syntax
      />
    ),
  },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

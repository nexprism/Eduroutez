'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { EmailTemplate } from '@/types';

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>, // Corrected formatting
  },
  {
    header: 'Subject',
    accessorKey: 'question', // Simplified with accessorKey
    cell: ({ row }) => <div>{row.original.subject}</div>,
  },
  // {
  //   header: 'Message',
  //   accessorKey: 'message', // Added accessorKey for consistency
  //   cell: ({ row }) => (
  //     <div className='text-wr'
  //       dangerouslySetInnerHTML={{ __html: row.original.message }} // Fixed syntax
  //     />
  //   ),
  // },
  {
    id: 'actions',
    header: 'Actions', // Added header for clarity
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

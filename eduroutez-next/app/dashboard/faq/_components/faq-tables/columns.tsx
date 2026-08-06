'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Faq } from '@/types';

export const columns: ColumnDef<Faq>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Question',
    cell: ({ row }) => (
      <div className="max-w-xs truncate font-medium">
        {row.original.question}
      </div>
    ),
  },
  {
    header: 'Answer',
    cell: ({ row }) => (
      <div className="max-w-md truncate text-sm text-muted-foreground">
        {row.original.answer || '-'}
      </div>
    ),
  },
  {
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.email || '-'}
      </div>
    ),
  },
  {
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

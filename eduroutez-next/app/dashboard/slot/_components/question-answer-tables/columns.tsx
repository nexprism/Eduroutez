'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Slot } from '@/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Slot>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Student Name',
    accessorKey: 'studentName',
    cell: ({ row }) => <div>{row.original?.studentId?.name || 'N/A'}</div>,
  },
  {
    header: 'Email',
    accessorKey: 'studentEmail',
    cell: ({ row }) => <div>{row.original?.studentId?.email || 'N/A'}</div>,
  },
  {
    header: 'Phone',
    accessorKey: 'studentPhone',
    cell: ({ row }) => <div>{row.original?.studentId?.phone || 'N/A'}</div>,
  },
  {
    header: 'Slot Time',
    accessorKey: 'slot',
    cell: ({ row }) => <div>{row.original?.slot || 'N/A'}</div>,
  },
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({ row }) => (
      <div>{new Date(row.original?.date).toLocaleDateString() || 'N/A'}</div>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <div>{row.original?.status || 'N/A'}</div>,
  },
  {
    header: 'Payment ID',
    accessorKey: 'paymentId',
    cell: ({ row }) => <div>{row.original?.paymentId || 'N/A'}</div>,
  },
  {
    header: 'Meeting Link',
    accessorKey: 'link',
    cell: ({ row }) =>
      row.original?.link ? (
        <a
          href={row.original.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Join Meeting
        </a>
      ) : (
        'N/A'
      ),
  },
   {
     id: 'actions',
     cell: ({ row }) => <CellAction data={row.original} />
   }
];


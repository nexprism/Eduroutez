'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types';

export const columns: ColumnDef<Student>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.name}`}</div>
  },
  {
    header: 'Email',
    cell: ({ row }) => <div>{`${row.original.email}`}</div>
  },
  {
    header: 'Phone',
    cell: ({ row }) => <div>{`${row.original.phone}`}</div>
  },
  {
    header: 'CREATED AT',
    cell: ({ row }) => {
      const date = new Date(`${row.original.createdAt}`);
      const formattedDate = `${String(date.getDate()).padStart(
        2,
        '0'
      )}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

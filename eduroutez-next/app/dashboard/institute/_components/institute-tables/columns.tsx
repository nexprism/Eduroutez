'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Institute } from '@/types';
import { ToggleStatus } from '@/components/ui/toggle-status';

export const columns: ColumnDef<Institute>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.instituteName}`}</div>
  },
  {
    header: 'COURSE',
    cell: ({ row }) => <div>{`${row.original.courses ? row.original.courses.length : 0}`}</div>
  },
  {
    header: 'ACTIVE',
    cell: ({ row }) => (
      <ToggleStatus
        checked={row.original.status ?? true}
        id={row.original._id}
        apiPath="institute"
        field="status"
        queryKey="institutes"
      />
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
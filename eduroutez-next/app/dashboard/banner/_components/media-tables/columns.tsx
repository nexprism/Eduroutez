'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Media } from '@/types';

export const columns: ColumnDef<Media>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    header: 'Name',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
  },

  // {
  //   accessorKey: 'status',
  //   header: 'STATUS',
  //   cell: ({ row }) => (
  //     <div className="flex w-32 space-x-1">
  //       <Badge
  //         variant={!row.original.status ? 'secondary' : 'default'}
  //         className="text-xs "
  //       >
  //         {row.original.status ? 'Active' : 'Inactive'}
  //       </Badge>
  //     </div>
  //   )
  // },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

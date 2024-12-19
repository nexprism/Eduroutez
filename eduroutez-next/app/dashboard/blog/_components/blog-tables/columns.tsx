'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Blog } from '@/types';

export const columns: ColumnDef<Blog>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false
  // },
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index+1}`}</div>
  },
  {
    header: 'TITLE',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
  },
  {
    header: 'IMAGE',
    cell: ({ row }) => <img src={row.original.image} alt="image" />
  },
  {
    header: 'CATEGORY',
    cell: ({ row }) => <div>{`${row.original.category}`}</div>
  },

  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={!row.original.status ? 'secondary' : 'default'}
          className="text-xs "
        >
          {row.original.status ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    )
  },
  {
    header: 'CREATED AT',
    // cell: ({ row }) => <div>{`${row.original.}`}</div>
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Institute } from '@/types';

export const columns: ColumnDef<Institute>[] = [
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
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.instituteName}`}</div>
  },
  {
    header: 'COURSE',
    cell: ({ row }) => <div>{`${2}`}</div>
  },
  {
    header: 'SALES',
    cell: ({ row }) => <div>{`${1}`}</div>
  },
  {
    header: 'INCOME',
    cell: ({ row }) => <div>{`${4}`}</div>
  },
  {
    header: 'BALANCE',
    cell: ({ row }) => <div>{`${4}`}</div>
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
    cell: ({ row }) => {
      const date = new Date("2024-12-12T05:29:55.480Z");
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

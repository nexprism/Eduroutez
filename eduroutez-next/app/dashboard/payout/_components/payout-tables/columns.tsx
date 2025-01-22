'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Payout } from '@/types';

export const columns: ColumnDef<Payout>[] = [
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
    header: 'USER ',
    // cell: ({ row }) => <div>{`${row.original.userType}`}</div>
  },
  {
    header: 'USER TYPE',
    cell: ({ row }) => <div>{`${row.original.userType}`}</div>
  },

  {
    header: 'REQUEST AMOUNT',
    cell: ({ row }) => <div>{`${row.original.requestedAmount}`}</div>
  },
  {
    header: 'PAYMENT METHOD',
    cell: ({ row }) => <div>{`${row.original.paymentMethod}`}</div>
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={!row.original.paymentStatus ? 'secondary' : 'default'}
          className="text-xs "
        >
          {row.original.status}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'PAYMENT STATUS',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={row.original.paymentStatus=='PENDING' ? 'secondary' : 'outline'}
          className="text-xs "
        >
          {row.original.paymentStatus}
        </Badge>
      </div>
    )
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

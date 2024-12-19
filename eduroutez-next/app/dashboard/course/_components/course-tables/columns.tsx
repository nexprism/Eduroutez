'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';

export const columns: ColumnDef<Course>[] = [
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
    cell: ({ row }) => <div>{`${row.original.courseTitle}`}</div>
  },
  {
    header: 'CATEGORY',
    cell: ({ row }) => <div>{`${row.original.category}`}</div>
  },
  {
    header: 'INSTRUCTOR',
    cell: ({ row }) => <div>{`${row.original.instructor}`}</div>
  },
  {
    header: 'CONTENT',
    cell: ({ row }) => <div>{`${row.original.instructor}`}</div>
  },
  {
    header: 'ENROLLMENT',
    cell: ({ row }) => <div>{`${row.original.instructor}`}</div>
  },

  {
    header: 'PRICE',
    cell: ({ row }) => <div>{`${row.original.coursePrice}`}</div>
  },

  {
    accessorKey: 'status',
    header: 'COURSE TYPE',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={ 'destructive'}
          className="text-xs "
        >
          {row.original.courseType}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: 'visibility',
    header: 'Visibilty',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={ 'outline'}
          className="text-xs "
        >
          {row.original.visibility}
        </Badge>
      </div>
    )
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
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

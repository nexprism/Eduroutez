'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Institute } from '@/types';
import { ro } from 'date-fns/locale';

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
    cell: ({ row }) => {
      console.log('Row:', row);
      return <div>{`${row.index + 1}`}</div>;
    }
  },
  {
    header: 'NAME',
    cell: ({ row }) => {
      console.log('Row:', row);
      return <div>{`${row.original.instituteName}`}</div>;
    }
  },
  {
    header: 'COURSE',
    cell: ({ row }) => {
      console.log('Row:', row);
      return <div>{`${row.original.courses.length}`}</div>;
    }
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      console.log('Row:', row);
      return (
        <div className="flex w-32 space-x-1">
          <Badge
            variant={!row.original.status ? 'secondary' : 'default'}
            className="text-xs "
          >
            {row.original.status ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      );
    }
  },
  {
    header: 'CREATED AT',
    cell: ({ row }) => {
      console.log('Row:', row);
      const date = new Date(row.original.updatedAt);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      console.log('Row:', row);
      return <CellAction data={row.original} />;
    }
  }
];
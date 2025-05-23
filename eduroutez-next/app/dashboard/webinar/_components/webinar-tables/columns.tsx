'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Webinar } from '@/types';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
export const columns: ColumnDef<Webinar>[] = [
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
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
  },
  {
    header: 'Icon',
    cell: ({ row }) => <img className='w-[2.5rem] h-[2rem] rounded-full' src={`${IMAGE_URL}/${row.original.image}`} alt="Icon" />
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => (
      <div className="flex w-32 space-x-1">
        <Badge
          variant={!row.original.status ? 'secondary' : 'default'}
          className="text-xs"
        >
          {row.original.status ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    )
  },
  {
    header: 'Time',
    cell: ({ row }) => <div>{`${row.original.time}`}</div>
  },
  {
    header: 'Duration',
    cell: ({ row }) => <div>{`${row.original.duration}`}</div>
  },
  {
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    header: 'Link',
    cell: ({ row }) => <div>{`${row.original.webinarLink}`}</div>
  },
  
  {
    header: 'Created By',
    cell: ({ row }) => {
      const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
      return <div>{role === 'SUPER_ADMIN' ? row.original?.instituteName || 'Admin created' : 'Me'}</div>;
    }
  },


  {
    header: 'CREATED AT',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

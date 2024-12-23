'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Blog } from '@/types';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

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
    header: 'Images',
    cell: ({ row }) => <img className='w-[2.5rem] h-[2rem] rounded-full' src={`${IMAGE_URL}/${row.original.image}`} alt="Icon" />
  },
  // {
  //   header: 'CATEGORY',
  //   cell: ({ row }) => <div>{`${row.original.category}`}</div>
  // },

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

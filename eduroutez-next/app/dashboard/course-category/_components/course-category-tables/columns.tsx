'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { CourseCategory } from '@/types';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

export const columns: ColumnDef<CourseCategory>[] = [
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
    header: 'Title',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
  },
  {
    header: 'Icon',
    cell: ({ row }) => <img className='w-[2.5rem] h-[2rem] rounded-full' src={`${IMAGE_URL}/${row.original.icon}`} alt="Icon" />
  },
  {
    header: 'Course',
    // cell: ({ row }) => <div>{`${row.original.parentCategory}`}</div>
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

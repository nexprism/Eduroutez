'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Counselor } from '@/types';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
export const columns: ColumnDef<Counselor>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.firstname} ${row.original.lastname}`}</div>
  },
  {
    header: 'CATEGORY',
    cell: ({ row }) => <div>{row.original.category}</div>
  },
  {
      header: 'Icon',
      cell: ({ row }) => <img className='w-[2.5rem] h-[2rem] rounded-full' src={`${IMAGE_URL}/${row.original.profilePicture}`} alt="Icon" />
  },
  {
    header: 'CREATED AT',
    cell: ({ row }) => {
      const date = new Date('2024-12-12T05:29:55.480Z');
      const formattedDate = `${String(date.getDate()).padStart(
        2,
        '0'
      )}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { News } from '@/types';
import { ToggleStatus } from '@/components/ui/toggle-status';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;

export const columns: ColumnDef<News>[] = [
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
  {
    header: 'Created By',
    cell: ({ row }) => {
      const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
      return <div>{role === 'SUPER_ADMIN' ? row.original?.instituteName || 'Admin created' : 'Me'}</div>;
    }
  },
  {
    header: 'PUBLISHED',
    cell: ({ row }) => (
      <ToggleStatus
        checked={row.original.isPublished ?? true}
        id={row.original._id}
        apiPath="update-news"
        queryKey="news"
      />
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

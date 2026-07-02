'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Blog } from '@/types';
import { ToggleStatus } from '@/components/ui/toggle-status';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGES;
const FALLBACK_IMAGE = '/placeholder-thumbnail.svg';

export const columns: ColumnDef<Blog>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'TITLE',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
  },
  {
    header: 'Images',
    cell: ({ row }) => (
      <img
        className="w-[2.5rem] h-[2rem] rounded-full object-cover"
        src={row.original.thumbnail ? `${IMAGE_URL}/${row.original.thumbnail}` : FALLBACK_IMAGE}
        alt="Thumbnail"
      />
    )
  },
  {
    header: 'PUBLISHED',
    cell: ({ row }) => (
      <ToggleStatus
        checked={row.original.isPublished ?? true}
        id={row.original._id}
        apiPath="career"
        queryKey="career"
      />
    )
  },
  {
    header: 'CREATED AT',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      return <div>{formattedDate}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

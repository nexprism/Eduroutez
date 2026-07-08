'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Promotion } from '@/types';
import axiosInstance from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const columns: ColumnDef<Promotion>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    header: 'NAME',
    cell: ({ row }) => <div>{`${row.original.title}`}</div>
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
    header: 'SHOW TITLE',
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const mutation = useMutation({
        mutationFn: async () => {
          const response = await axiosInstance({
            url: `${apiUrl}/promotion/${row.original._id}`,
            method: 'PATCH',
            data: { showTitle: !row.original.showTitle },
            headers: { 'Content-Type': 'application/json' }
          });
          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['Promotions'] });
          toast.success('Updated successfully');
        },
        onError: () => toast.error('Failed to update')
      });

      return (
        <button
          type="button"
          role="switch"
          aria-checked={row.original.showTitle}
          onClick={() => mutation.mutate()}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            row.original.showTitle ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              row.original.showTitle ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      );
    }
  },

  {
    header: 'URL',
    accessorKey: 'link',
    cell: ({ row }) => {
      const url = row.original.link;
      if (!url) return <div className="text-gray-400">—</div>;
      return (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 truncate block max-w-[200px]"
          title={url}
        >
          {url}
        </a>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

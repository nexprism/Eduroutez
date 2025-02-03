'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Review } from '@/types';


export const columns: ColumnDef<Review>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{`${row.index + 1}`}</div>
  },
  {
    header: 'Reviewed To',
    cell: ({ row }) => <div>{`${row.original.counselorName}`}</div>
  },
  {
    header: 'Reviewed By',
    cell: ({ row }) => <div>{`${row.original.studentEmail}`}</div>
  },
  {
    header: 'Review',
    cell: ({ row }) => <div>{`${row.original.comment}`}</div>
  },
  {
    header: 'Reviwed AT',
    cell: ({ row }) => {
      if (!row.original.date) return <div>N/A</div>;
      const date = new Date(Number(row.original.date));
      return (
        <div>
          {date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      );
    }
  },
  
];

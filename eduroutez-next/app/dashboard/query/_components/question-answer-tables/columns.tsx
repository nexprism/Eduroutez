'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Query } from '@/types';

export const columns: ColumnDef<Query>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }) => {
      const type = row.original.type;
      if (type === 'application') {
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Application</Badge>;
      }
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Query</Badge>;
    },
  },
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }) => <div>{typeof row.original.name === 'object' ? JSON.stringify(row.original.name) : String(row.original.name || '')}</div>,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: ({ row }) => <div>{typeof row.original.email === 'object' ? JSON.stringify(row.original.email) : String(row.original.email || '')}</div>,
  },
  {
    header: 'Phone No',
    accessorKey: 'phoneNo',
    cell: ({ row }) => <div>{typeof row.original.phoneNo === 'object' ? JSON.stringify(row.original.phoneNo) : String(row.original.phoneNo || '')}</div>,
  },
  {
    header: 'City',
    accessorKey: 'city',
    cell: ({ row }) => <div>{typeof row.original.city === 'object' ? (row.original.city as any)?.name : row.original.city}</div>,
  },
  {
    header: 'Query Related To',
    accessorKey: 'queryRelatedTo',
    cell: ({ row }) => <div>{String(row.original.queryRelatedTo || '')}</div>,
  },
  {
    header: 'Institute',
    accessorKey: 'instituteIds',
    cell: ({ row }) => {
      const ids = row.original.instituteIds;
      if (!ids || ids.length === 0) return <div className="text-gray-400">—</div>;
      const names = ids.map((i: any) => (typeof i === 'object' ? i.instituteName : i)).join(', ');
      return <div className="max-w-[200px] truncate" title={names}>{names}</div>;
    },
  },
  {
    header: 'Stream',
    accessorKey: 'stream',
    cell: ({ row }) => {
      const s = row.original.stream;
      if (!s) return <div className="text-gray-400">—</div>;
      const name = typeof s === 'object' ? s.name : s;
      return <div>{name}</div>;
    },
  },
  {
    header: 'Level',
    accessorKey: 'level',
    cell: ({ row }) => <div>{row.original.level || <span className="text-gray-400">—</span>}</div>,
  },
  {
    header: 'Query',
    accessorKey: 'query',
    cell: ({ row }) => <div>{String(row.original.query || '')}</div>,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <div>{String(row.original.status || '')}</div>,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleString()}</div>,
  },
  {
    header: 'Updated At',
    accessorKey: 'updatedAt',
    cell: ({ row }) => <div>{new Date(row.original.updatedAt).toLocaleString()}</div>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

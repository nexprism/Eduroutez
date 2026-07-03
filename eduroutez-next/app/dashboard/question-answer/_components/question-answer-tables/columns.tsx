'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { QuestionAnswer } from '@/types';

export const columns: ColumnDef<QuestionAnswer>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Question',
    cell: ({ row }) => (
      <div className="max-w-xs truncate font-medium">
        {row.original.question}
      </div>
    ),
  },
  {
    header: 'Asked By',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {typeof row.original.askedBy === 'object'
          ? (row.original.askedBy as any)?.name || (row.original.askedBy as any)?.email
          : row.original.askedBy || '-'}
      </div>
    ),
  },
  {
    header: 'Answers',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.answers?.length || 0}
      </Badge>
    ),
  },
  {
    header: 'Grade',
    cell: ({ row }) => <div>{row.original.grade || '-'}</div>,
  },
  {
    header: 'Label',
    cell: ({ row }) => <div>{row.original.label || '-'}</div>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

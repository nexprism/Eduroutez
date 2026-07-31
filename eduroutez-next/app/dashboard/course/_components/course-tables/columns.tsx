'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleStatus } from '@/components/ui/toggle-status';

interface ColumnHandlers {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}

export function createColumns({
  selectedIds,
  onToggle,
  onToggleAll
}: ColumnHandlers): ColumnDef<Course>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => {
        const pageRows = table.getRowModel().rows.map(
          (row) => (row.original as Course)._id
        );
        const allSelected =
          pageRows.length > 0 && pageRows.every((id) => selectedIds.has(id));
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onToggleAll(pageRows)}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => {
        const course = row.original as Course;
        return (
          <Checkbox
            checked={selectedIds.has(course._id)}
            onCheckedChange={() => onToggle(course._id)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      header: 'ID',
      cell: ({ row }) => <div>{`${row.index + 1}`}</div>
    },
    {
      header: 'NAME',
      cell: ({ row }) => <div>{`${row.original.courseTitle}`}</div>
    },
    {
      header: 'CATEGORY',
      cell: ({ row }) => <div>{`${row.original.category}`}</div>
    },
    {
      header: 'PRICE',
      cell: ({ row }) => (
        <div>
          {row.original.coursePrice ? `${row.original.coursePrice}` : 'Free'}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'COURSE TYPE',
      cell: ({ row }) => (
        <div className="flex w-32 space-x-1">
          <Badge variant={'destructive'} className="text-xs">
            {row.original.courseType}
          </Badge>
        </div>
      )
    },
    {
      header: 'PUBLISHED',
      cell: ({ row }) => (
        <ToggleStatus
          checked={row.original.isPublished ?? true}
          id={row.original._id}
          apiPath="course"
          queryKey="courses"
        />
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
}

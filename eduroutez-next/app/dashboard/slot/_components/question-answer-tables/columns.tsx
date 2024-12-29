'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { Slot } from '@/types';
import axiosInstance from '@/lib/axios';

export const columns: ColumnDef<Slot>[] = [
  {
    header: 'ID',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    header: 'Student',
    accessorKey: 'student',
    cell: ({ row }) => <div>{row.original.studentEmail}</div>,
  },
  {
    header: 'Slot',
    accessorKey: 'slot',
    cell: ({ row }) => <div>{row.original.slot}</div>,
  },
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({ row }) => <div>{row.original.date}</div>,
  },
  {
    id: 'select',
    header: 'Completed',
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.completed}
        onCheckedChange={async (value) => {
          const isSelected = !!value;

          // Update locally for immediate feedback
          row.original.completed = isSelected;

          try {
            const response = await axiosInstance({
              url: '/markslot',
              method: 'post',
              data: {
                email: localStorage.getItem('email'),
                studentEmail: row.original.studentEmail,
                completed: isSelected,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response) {
              throw new Error('Failed to update status');
            }

            alert('Status updated successfully');
            console.log('API Response:', response);
          } catch (error) {
            console.error('Error updating slot:', error);

            // Revert the change locally if the API call fails
            row.original.completed = !isSelected;
          }
        }}
        aria-label="Select row"
        className="ml-6"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

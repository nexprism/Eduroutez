'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

export const columns: ColumnDef<User>[] = [
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
    header: 'IMAGE',
    cell: ({ row }) => <ImageCell image={row.original.image ?? ''} />
  },
  {
    accessorKey: 'name', // Updated to 'name' as a key column
    header: 'NAME'
  },
  {
    accessorKey: 'email', // Email as an important identifier
    header: 'EMAIL'
  },
  {
    accessorKey: 'roles',
    header: 'ROLES',
    cell: ({ row }) => (
      <div className="flex space-x-1">
        <Badge variant="default" className="text-xs text-white">
          {row.original.role}
        </Badge>
      </div>
    ) // Display roles as badges
  },
  {
    header: 'CREATED AT',
    cell: ({ row }) => (
      <div>{new Date(row.original.createdAt).toLocaleDateString('en-IN')}</div>
    )
  }
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];

const ImageCell = ({ image }: { image: string }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl1 = process.env.NEXT_PUBLIC_IMAGES;
  const imageUrl = `${imageUrl1}/${image}`; // Assuming imageUrl is defined

  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-gray-200">
      {image && !hasError ? ( // Check for image existence and error
        <Image
          src={imageUrl}
          alt="image"
          height={48}
          width={48}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)} // Set error if image fails to load
        />
      ) : (
        <div className="text-gray-500">NA</div> // Show NA if image not found or error
      )}
    </div>
  );
};

export default ImageCell;

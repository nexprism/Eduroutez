'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Blog } from '@/types';

export default function BlogTable({
  data,
  totalData,
  onPageChange
}: {
  data: Blog[];
  totalData: number;
  onPageChange: (page: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data using regex for local filtering
  const filteredData = searchQuery 
    ? data.filter((item) => {
        const regex = new RegExp(searchQuery, 'i');
        return regex.test(item.title);
      })
    : data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-4 py-2"
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        totalItems={totalData}
      />
    </div>
  );
}
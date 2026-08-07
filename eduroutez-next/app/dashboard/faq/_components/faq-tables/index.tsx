'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Faq } from '@/types';

export default function FaqTable({
  data,
  totalData
}: {
  data: Faq[];
  totalData: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const regex = new RegExp(searchQuery, 'i');
        return regex.test(item.question || '');
      })
    : [];

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
      <DataTable columns={columns} data={filteredData} totalItems={totalData} />
    </div>
  );
}

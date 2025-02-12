'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Institute } from '@/types';

export default function UserTable({
  data,
  totalData
}: {
  data: Institute[];
  totalData: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const regex = new RegExp(searchQuery, 'i');
    return data.filter(institute => regex.test(institute.instituteName));
  }, [searchQuery, data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <DataTable columns={columns} data={filteredData} totalItems={totalData} />
    </div>
  );
}

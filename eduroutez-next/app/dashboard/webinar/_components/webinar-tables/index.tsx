'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Webinar } from '@/types';

export default function WebinarTable({
  data,
  totalData
}: {
  data: Webinar[];
  totalData: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const regex = new RegExp(query, 'i'); // Case-insensitive regex
    const filtered = data.filter((item) =>
      Object.values(item).some((value) => regex.test(String(value)))
    );

    setFilteredData(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded px-4 py-2"
        />
      </div>
      <DataTable columns={columns} data={filteredData} totalItems={totalData} />
    </div>
  );
}

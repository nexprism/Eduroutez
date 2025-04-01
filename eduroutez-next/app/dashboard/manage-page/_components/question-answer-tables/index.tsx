'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { QuestionAnswer } from '@/types';

export default function QuestionAnswerTable({
  data,
  totalData
}: {
  data: QuestionAnswer[];
  totalData: number;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data using regex
  const filteredData = data.filter((item) => {
    const regex = new RegExp(searchQuery, 'i'); // 'i' for case-insensitive search
    return regex.test(item.title); // Assuming 'name' is a property in QuestionAnswer
  });

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

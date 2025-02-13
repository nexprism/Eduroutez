'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { useCounselorTableFilters } from './use-counselor-table-filters';
import { Counselor } from '@/types';

export default function CounselorTable({
  data,
  totalData
}: {
  data: Counselor[];
  totalData: number;
}) {
  const { setPage } = useCounselorTableFilters();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const regex = new RegExp(searchQuery, 'i');
    return data.filter(counselor => regex.test(counselor.firstname));
  }, [searchQuery, data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // Reset to the first page when search query changes
          }}
          className="border p-2 rounded"
        />
        {/* <DataTableFilterBox
          filterKey="role"
          title="Role"
          options={ROLE_OPTIONS}
          setFilterValue={setRoleFilter}
          filterValue={roleFilter}
        />
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        /> */}
      </div>
      <DataTable columns={columns} data={filteredData} totalItems={totalData} />
    </div>
  );
}

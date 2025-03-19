'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Review } from '@/types';
import { useReviewTableFilters } from './use-review-table-filters';

export default function ReviewTable({
  data,
  totalData
}: {
  data: Review[];
  totalData: number;
}) {
  const { setPage } = useReviewTableFilters();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data?.result?.filter((review:any) =>
    new RegExp(searchQuery, 'i').test(review.fullName)
  );

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // Reset to the first page on search
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

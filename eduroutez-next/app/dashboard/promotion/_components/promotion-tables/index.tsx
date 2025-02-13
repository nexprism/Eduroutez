'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Promotion } from '@/types';
import { usePromotionTableFilters } from './use-promotion-table-filters';

export default function PromotionTable({
  data,
  totalData
}: {
  data: Promotion[];
  totalData: number;
}) {
  const { setPage } = usePromotionTableFilters();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to the first page on search
  };

  const filteredData = data.filter((promotion) =>
    new RegExp(searchQuery, 'i').test(promotion.title)
  );

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={handleSearch}
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

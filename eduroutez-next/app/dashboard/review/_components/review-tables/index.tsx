'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
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
  const { searchQuery, setPage, setSearchQuery } = useReviewTableFilters();

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
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
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}

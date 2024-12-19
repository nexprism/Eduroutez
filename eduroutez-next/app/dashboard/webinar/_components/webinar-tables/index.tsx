'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { Webinar } from '@/types';
import { useWebinarTableFilters } from './use-webinar-table-filters';

export default function WebinarTable({
  data,
  totalData
}: {
  data: Webinar[];
  totalData: number;
}) {
  const { searchQuery, setPage, setSearchQuery } = useWebinarTableFilters();

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

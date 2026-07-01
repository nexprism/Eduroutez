'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { useInstituteTableFilters } from './use-institute-table-filters';
import { Institute } from '@/types';

export default function InstituteTable({
  data,
  totalData
}: {
  data: Institute[];
  totalData: number;
}) {
  const { searchQuery, setSearchQuery, setPage, organizationFilter, setOrganizationFilter } = useInstituteTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <select
          value={organizationFilter}
          onChange={(e) => {
            setOrganizationFilter(e.target.value || null);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="University">University</option>
          <option value="College">College</option>
          <option value="Institute">Institute</option>
          <option value="Polytechnic">Polytechnic</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}

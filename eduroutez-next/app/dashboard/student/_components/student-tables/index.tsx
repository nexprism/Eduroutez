'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { Student } from '@/types';
import { useStudentTableFilters } from './use-student-table-filters';

export default function StudentTable({
  data,
  totalData
}: {
  data: Student[];
  totalData: number;
}) {
  const { setPage } = useStudentTableFilters();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(student =>
    new RegExp(searchQuery, 'i').test(student.name)
  );

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        {/* <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        /> */}
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

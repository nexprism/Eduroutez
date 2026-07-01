'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { useStudentTableFilters } from './use-student-table-filters';
import { Student } from '@/types';

export default function StudentTable({
  data,
  totalData
}: {
  data: Student[];
  totalData: number;
}) {
  const { searchQuery, setSearchQuery, setPage } = useStudentTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}

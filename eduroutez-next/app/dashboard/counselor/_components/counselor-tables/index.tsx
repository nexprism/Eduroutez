'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
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
  const { searchQuery, setSearchQuery, setPage } = useCounselorTableFilters();

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

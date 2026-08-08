'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { useBlogTableFilters } from './use-blog-table-filters';
import { Blog } from '@/types';

export default function BlogTable({
  data,
  totalData
}: {
  data: Blog[];
  totalData: number;
}) {
  const { searchQuery, setSearchQuery, setPage } = useBlogTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="news"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}

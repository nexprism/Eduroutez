'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { useQuestionAnswerTableFilters } from './use-question-answer-table-filters';
import { QuestionAnswer } from '@/types';

export default function QuestionAnswerTable({
  data,
  totalData
}: {
  data: QuestionAnswer[];
  totalData: number;
}) {
  const { searchQuery, setSearchQuery, setPage } = useQuestionAnswerTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="questions"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}

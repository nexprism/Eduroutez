'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { Query } from '@/types';
import { useQuestionAnswerTableFilters } from './use-question-answer-table-filters';

interface QuestionAnswerTableProps {
  data: Query[];
  totalData: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function QuestionAnswerTable({
  data,
  totalData,
  currentPage,
  totalPages,
  isLoading,
  onPageChange
}: QuestionAnswerTableProps) {
  const { searchQuery, setSearchQuery } = useQuestionAnswerTableFilters();

  return (
    <div className="space-y-4">
      {/*<div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name"
        />
      </div>*/}
      <DataTable 
        columns={columns} 
        data={data} 
        totalItems={totalData}
        pageCount={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
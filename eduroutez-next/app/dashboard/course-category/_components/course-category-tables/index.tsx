'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './columns';
import { useCourseCategoryTableFilters } from './use-course-category-table-filters';
import { CourseCategory } from '@/types';

export default function CourseCategoryTable({
  data,
  totalData,
}: {
  data: CourseCategory[];
  totalData: number;
}) {
  const { setPage } = useCourseCategoryTableFilters();
  const [searchInput, setSearchInput] = useState('');
  const [filteredData, setFilteredData] = useState<CourseCategory[]>(data);

  // Apply regex search filter to data
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredData(data);
      return;
    }

    try {
      const regex = new RegExp(searchInput, 'i');
      const filtered = data.filter(item => 
        // Search through all string properties of the item
        Object.keys(item).some(key => {
          const value = item[key as keyof CourseCategory];
          return typeof value === 'string' && regex.test(value);
        })
      );
      setFilteredData(filtered);
    } catch (error) {
      // In case of invalid regex
      console.error('Invalid regex:', error);
      setFilteredData(data);
    }
  }, [searchInput, data]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Custom search bar with regex support */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search with regex..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Commented out filters as in original code */}
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
      
      <DataTable 
        columns={columns} 
        data={filteredData} 
        totalItems={filteredData.length === data.length ? totalData : filteredData.length} 
      />
    </div>
  );
}
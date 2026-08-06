'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback } from 'react';

export function useFaqTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'name',
    searchParams.name
      .withOptions({ shallow: false })
      .withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const [limit, setLimit] = useQueryState(
    'limit',
    searchParams.limit.withDefault(10)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setPage(1);
  }, [setSearchQuery, setPage]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    limit,
    setLimit,
    resetFilters
  };
}

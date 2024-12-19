'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';

export function usePagination() {
  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const [limit, setLimit] = useQueryState(
    'limit',
    searchParams.limit.withDefault(10)
  );

  return {
    page,
    setPage,
    limit,
    setLimit
  };
}

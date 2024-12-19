'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' }
];

export function useWebinarTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'name',
    searchParams.name
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [roleFilter, setRoleFilter] = useQueryState(
    'roles',
    searchParams.roles.withOptions({ shallow: false }).withDefault('')
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
    setRoleFilter(null);

    setPage(1);
  }, [setSearchQuery, setRoleFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!roleFilter;
  }, [searchQuery, roleFilter]);

  return {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    limit,
    setLimit,
    resetFilters,
    isAnyFilterActive
  };
}

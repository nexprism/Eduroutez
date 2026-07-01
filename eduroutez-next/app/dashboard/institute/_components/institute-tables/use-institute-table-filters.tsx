'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' }
];

export function useInstituteTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'name',
    searchParams.name
      .withOptions({ shallow: false })
      .withDefault('')
  );

  const [organizationFilter, setOrganizationFilter] = useQueryState(
    'organization',
    searchParams.organization.withDefault('')
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
    setOrganizationFilter(null);

    setPage(1);
  }, [setSearchQuery, setOrganizationFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!organizationFilter;
  }, [searchQuery, organizationFilter]);

  return {
    searchQuery,
    setSearchQuery,
    organizationFilter,
    setOrganizationFilter,
    page,
    setPage,
    limit,
    setLimit,
    resetFilters,
    isAnyFilterActive
  };
}

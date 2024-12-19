import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  name: parseAsString,
  roles: parseAsString,
  categories: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);

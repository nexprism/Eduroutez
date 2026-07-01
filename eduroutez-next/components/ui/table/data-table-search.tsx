'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Options } from 'nuqs';
import { useTransition, useState, useEffect, useCallback } from 'react';

interface DataTableSearchProps {
  searchKey: string;
  searchQuery: string;
  setSearchQuery: (
    value: string | ((old: string) => string | null) | null,
    options?: Options<any> | undefined
  ) => Promise<URLSearchParams>;
  setPage: <Shallow>(
    value: number | ((old: number) => number | null) | null,
    options?: Options<Shallow> | undefined
  ) => Promise<URLSearchParams>;
}

export function DataTableSearch({
  searchKey,
  searchQuery,
  setSearchQuery,
  setPage
}: DataTableSearchProps) {
  const [isLoading, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(searchQuery ?? '');

  useEffect(() => {
    setInputValue(searchQuery ?? '');
  }, [searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || null, { startTransition });
    setPage(1);
  }, [setSearchQuery, setPage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    }
  };

  const handleClear = useCallback(() => {
    setInputValue('');
    setSearchQuery(null, { startTransition });
    setPage(1);
  }, [setSearchQuery, setPage]);

  return (
    <div className="flex w-full items-center gap-2 md:max-w-sm">
      <div className="relative w-full">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn('w-full pr-8', isLoading && 'animate-pulse')}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground hover:text-foreground"
            type="button"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={() => handleSearch(inputValue)}
        disabled={isLoading}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}

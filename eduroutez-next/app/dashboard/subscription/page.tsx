import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import React from 'react';
import SubscriptionListingPage from './_components/subscription-listing-page';

type pageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : Subscriptions'
};

export default async function Page({ searchParams }: pageProps) {
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);
  return <SubscriptionListingPage />;
}

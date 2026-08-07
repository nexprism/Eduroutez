import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import React from 'react';
import FaqListingPage from './_components/faq-listing-page';

type pageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : FAQs'
};

export default async function Page({ searchParams }: pageProps) {
  searchParamsCache.parse(searchParams);
  return <FaqListingPage />;
}

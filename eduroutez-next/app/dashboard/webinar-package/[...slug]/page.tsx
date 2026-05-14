import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import React from 'react';
import WebinarPackageViewPage from '../_components/webinar-package-view-page';

type pageProps = {
  params: {
    slug: string[];
  };
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : Webinar Package Details'
};

export default async function Page({ params, searchParams }: pageProps) {
  searchParamsCache.parse(searchParams);
  return <WebinarPackageViewPage params={params} />;
}

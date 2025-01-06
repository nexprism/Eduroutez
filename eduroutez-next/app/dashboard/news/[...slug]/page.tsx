import NewsViewPage from '../_components/news-view-page';

export const metadata = {
  title: 'Dashboard : News'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <NewsViewPage />;
}

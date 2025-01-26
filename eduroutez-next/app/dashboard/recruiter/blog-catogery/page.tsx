import BlogViewPage from '../_components/blog-catogery-view-page';

export const metadata = {
  title: 'Dashboard : Blog'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <BlogViewPage />;
}

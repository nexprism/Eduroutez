import BlogViewPage from '../_components/blog-view-page';

export const metadata = {
  title: 'Dashboard : Blog'
};

export default function Page({ params }: { params: { slug: string } }) {
  return <BlogViewPage />;
}

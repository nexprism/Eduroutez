import BlogCategoryViewPage from '../_components/blog-catogery-view-page';
import BlogViewPage from '../_components/blog-view-page';

export const metadata = {
  title: 'Dashboard : Blog'
};

export default function Page({ params }: { params: { slug: string[] } }) {
  const isCategoryPage = params.slug.includes('category');

  return isCategoryPage ? <BlogCategoryViewPage /> : <BlogViewPage />;
}

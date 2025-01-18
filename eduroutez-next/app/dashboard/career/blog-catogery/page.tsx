import BlogcategoryPage from '../_components/blog-catogery-view-page';
import BlogCatogeryForm from '../_components/blog-catogery-form';
export const metadata = {
  title: 'Dashboard : Career'
};

export default function Page({ params }: { params: { slug: string } }) {
  console.log('params');
  return <BlogCatogeryForm />;
}

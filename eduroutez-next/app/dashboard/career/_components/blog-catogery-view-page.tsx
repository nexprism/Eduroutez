import BlogCatogeryForm from './blog-catogery-form';
import PageContainer from '@/components/layout/page-container';

export default function BlogCategoryViewPage() {
  console.log('BlogViewPagghjne');
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <BlogCatogeryForm />
      </div>
    </PageContainer>
  );
}

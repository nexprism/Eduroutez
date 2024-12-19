import PageContainer from '@/components/layout/page-container';
import CourseCategoryForm from './course-category-form';

export default function CourseCategoryViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 ">
        <CourseCategoryForm />
      </div>
    </PageContainer>
  );
}

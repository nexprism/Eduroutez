import CourseForm from './course-form';
import PageContainer from '@/components/layout/page-container';

export default function CourseViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 ">
        <CourseForm />
      </div>
    </PageContainer>
  );
}

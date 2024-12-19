import StudentForm from './student-form';
import PageContainer from '@/components/layout/page-container';

export default function StudentViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <StudentForm />
      </div>
    </PageContainer>
  );
}

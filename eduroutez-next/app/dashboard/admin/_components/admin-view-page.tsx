import AdminForm from './admin-form';
import PageContainer from '@/components/layout/page-container';

export default function AdminViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 lg:p-8">
        <AdminForm />
      </div>
    </PageContainer>
  );
}

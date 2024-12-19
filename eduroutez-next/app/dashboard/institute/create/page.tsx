import PageContainer from '@/components/layout/page-container';
import InstituteCreateForm from '../_components/create-form';

export default function Page() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 ">
        <InstituteCreateForm />
      </div>
    </PageContainer>
  );
}
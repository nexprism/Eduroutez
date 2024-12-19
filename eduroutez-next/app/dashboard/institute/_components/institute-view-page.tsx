import InstituteForm from './institute-form';
import PageContainer from '@/components/layout/page-container';

export default function InstituteViewPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 ">
        <InstituteForm />
      </div>
    </PageContainer>
  );
}

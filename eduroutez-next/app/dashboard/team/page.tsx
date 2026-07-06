import PageContainer from '@/components/layout/page-container';
import TeamManagement from './_components/team-management';

export const metadata = {
  title: 'Dashboard : Team Management'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <TeamManagement />
    </PageContainer>
  );
}

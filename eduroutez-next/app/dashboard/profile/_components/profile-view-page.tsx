'use client';
import PageContainer from '@/components/layout/page-container';
import ProfileCreateForm from './profile-create-form';

import { useEffect, useState } from 'react';
import InstituteForm from './institute-form';

export default function ProfileViewPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  return (
    <PageContainer>
      <div className="space-y-4">
        {role === 'counsellor' && <ProfileCreateForm categories={[]} initialData={null} />}
        {role === 'institute' && <InstituteForm />}
      </div>
    </PageContainer>
  );
}

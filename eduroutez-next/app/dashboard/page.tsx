import { redirect } from 'next/navigation';
import React from 'react';

function page() {
  redirect('/dashboard/overview');
  return <div>page</div>;
}

export default page;

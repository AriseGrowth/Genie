'use client';

import AuthGuard from '../../components/AuthGuard';
import DraftList from '../../components/Drafts/DraftList';

export default function DraftsPage() {
  return (
    <AuthGuard>
      <DraftList />
    </AuthGuard>
  );
}

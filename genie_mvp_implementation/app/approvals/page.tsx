'use client';

import AuthGuard from '../../components/AuthGuard';
import ApprovalQueue from '../../components/Approvals/ApprovalQueue';

export default function ApprovalsPage() {
  return (
    <AuthGuard>
      <ApprovalQueue />
    </AuthGuard>
  );
}

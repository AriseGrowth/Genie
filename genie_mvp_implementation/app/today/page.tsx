'use client';

import AuthGuard from '../../components/AuthGuard';
import TodayBriefCard from '../../components/TodayBrief/TodayBriefCard';

export default function TodayPage() {
  return (
    <AuthGuard>
      <TodayBriefCard />
    </AuthGuard>
  );
}

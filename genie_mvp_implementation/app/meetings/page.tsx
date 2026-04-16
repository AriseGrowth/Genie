'use client';

import AuthGuard from '../../components/AuthGuard';
import MeetingInput from '../../components/Meetings/MeetingInput';

export default function MeetingsPage() {
  return (
    <AuthGuard>
      <MeetingInput />
    </AuthGuard>
  );
}

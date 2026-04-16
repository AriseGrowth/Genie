'use client';

import AuthGuard from '../components/AuthGuard';
import ChatWindow from '../components/Chat/ChatWindow';

export default function HomePage() {
  return (
    <AuthGuard>
      <ChatWindow />
    </AuthGuard>
  );
}

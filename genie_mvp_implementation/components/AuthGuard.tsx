'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../lib/UserContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login');
    }
  }, [loading, session, router]);

  if (loading) return <LoadingSpinner fullscreen />;
  if (!session) return null;
  return <>{children}</>;
}

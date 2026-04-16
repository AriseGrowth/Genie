'use client';

import { useEffect } from 'react';
import AuthGuard from '../components/AuthGuard';
import { useGenie } from '../lib/GenieContext';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { setOpen } = useGenie();

  // Auto-open the Genie panel when landing on home
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(timer);
  }, [setOpen]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.orbLarge}>✦</div>
        <h1 className={styles.heading}>Welcome to Genie</h1>
        <p className={styles.sub}>Your AI executive assistant is ready. Click the orb or speak your wish.</p>
      </div>
    </div>
  );
}

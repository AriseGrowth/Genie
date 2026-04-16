'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useUser } from '../../../lib/UserContext';
import styles from './login.module.css';

export default function LoginPage() {
  const { session, loading } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && session) router.push('/');
  }, [loading, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>✦</span>
          <h1 className={styles.title}>Genie</h1>
          <p className={styles.subtitle}>AI Executive Assistant</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}
          <button className={styles.btn} type="submit" disabled={submitting}>
            {submitting ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          className={styles.toggle}
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import MeetingSummaryCard from './MeetingSummaryCard';
import styles from './MeetingInput.module.css';
import type { MeetingSummary } from '../../types';

export default function MeetingInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [error, setError] = useState('');
  const { workspaceKind } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const res = await apiFetch('/api/meetings/summarize', {
        method: 'POST',
        body: JSON.stringify({ workspaceKind, meetingText: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Summarization failed');
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Meeting Summarizer</h2>
        <p className={styles.subtitle}>Paste meeting notes or transcript to extract decisions and action items.</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste meeting notes or transcript here…"
          rows={10}
          disabled={loading}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.btn} type="submit" disabled={!text.trim() || loading}>
          {loading ? 'Summarizing…' : 'Summarize'}
        </button>
      </form>
      {summary && <MeetingSummaryCard summary={summary} />}
    </div>
  );
}

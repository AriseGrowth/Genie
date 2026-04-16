'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import styles from './MeetingSummaryCard.module.css';
import type { MeetingSummary } from '../../types';

export default function MeetingSummaryCard({ summary }: { summary: MeetingSummary }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const { workspaceKind } = useWorkspace();

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const createTasks = async () => {
    setCreating(true);
    const items = summary.actionItems.filter(a => selected.has(a.id));
    await Promise.all(
      items.map(item =>
        apiFetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ workspaceKind, title: item.title, dueAt: item.dueAt }),
        })
      )
    );
    setCreating(false);
    setCreated(true);
    setSelected(new Set());
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{summary.title}</h3>
      <p className={styles.summary}>{summary.summary}</p>

      {summary.decisions.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Decisions</h4>
          <ul className={styles.list}>
            {summary.decisions.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </section>
      )}

      {summary.actionItems.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Action Items</h4>
          <div className={styles.actionItems}>
            {summary.actionItems.map(item => (
              <label key={item.id} className={styles.actionRow}>
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <span className={styles.actionTitle}>{item.title}</span>
                {item.owner && <span className={styles.owner}>{item.owner}</span>}
                {item.dueAt && (
                  <span className={styles.due}>{new Date(item.dueAt).toLocaleDateString()}</span>
                )}
              </label>
            ))}
          </div>
          <div className={styles.actionBar}>
            {selected.size > 0 && (
              <button className={styles.createBtn} onClick={createTasks} disabled={creating}>
                {creating ? 'Creating…' : `Create ${selected.size} task(s)`}
              </button>
            )}
            {created && <span className={styles.success}>Tasks created!</span>}
          </div>
        </section>
      )}

      {summary.followupDraft && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Follow-up Draft</h4>
          <div className={styles.draft}>
            <p className={styles.draftSubject}>{summary.followupDraft.subject}</p>
            <p className={styles.draftBody}>{summary.followupDraft.body.slice(0, 200)}…</p>
          </div>
        </section>
      )}
    </div>
  );
}

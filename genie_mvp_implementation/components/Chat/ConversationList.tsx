'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import styles from './ConversationList.module.css';

interface Conversation {
  id: string;
  workspaceId: string;
  createdAt: string;
  preview: string;
  lastRole: string;
}

interface Props {
  onSelect: (id: string) => void;
  currentId: string | null;
}

export default function ConversationList({ onSelect, currentId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/conversations')
      .then(r => r.json())
      .then(d => setConversations(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading history…</div>;
  }

  if (conversations.length === 0) {
    return <div className={styles.empty}>No past conversations yet.</div>;
  }

  return (
    <div className={styles.list}>
      {conversations.map(conv => {
        const date = new Date(conv.createdAt);
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const workspace = conv.workspaceId?.split('-').pop() ?? '';
        return (
          <button
            key={conv.id}
            className={`${styles.item} ${conv.id === currentId ? styles.active : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className={styles.itemTop}>
              <span className={styles.date}>{label} · {time}</span>
              {workspace && <span className={styles.ws}>{workspace}</span>}
            </div>
            <p className={styles.preview}>
              {conv.preview || 'Empty conversation'}
            </p>
          </button>
        );
      })}
    </div>
  );
}

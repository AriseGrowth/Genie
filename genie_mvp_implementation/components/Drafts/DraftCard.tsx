'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import styles from './DraftCard.module.css';
import type { EmailDraft } from '../../types';

interface Props {
  draft: EmailDraft;
  onRefresh: () => void;
}

export default function DraftCard({ draft, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { workspaceKind } = useWorkspace();

  const requestSend = async () => {
    setRequesting(true);
    await apiFetch(`/api/drafts/${draft.id}/request-send`, {
      method: 'POST',
      body: JSON.stringify({ workspaceKind }),
    });
    setRequesting(false);
    onRefresh();
  };

  const statusClass = styles[`status_${draft.status}`] ?? '';

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setExpanded(v => !v)}>
        <div className={styles.headerLeft}>
          <p className={styles.subject}>{draft.subject}</p>
          <p className={styles.to}>To: {draft.to.join(', ')}</p>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.badge} ${statusClass}`}>{draft.status.replace(/_/g, ' ')}</span>
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          {draft.cc.length > 0 && <p className={styles.meta}>CC: {draft.cc.join(', ')}</p>}
          <p className={styles.bodyText}>{draft.body}</p>
          <div className={styles.actions}>
            {draft.status === 'draft' && (
              <button className={styles.btn} onClick={requestSend} disabled={requesting}>
                {requesting ? 'Requesting…' : 'Request Send'}
              </button>
            )}
            <span className={styles.date}>
              {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

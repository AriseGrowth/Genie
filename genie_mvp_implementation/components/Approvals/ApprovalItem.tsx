'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import styles from './ApprovalItem.module.css';
import type { Approval } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  send_email: 'Send Email',
  create_calendar_event: 'Create Calendar Event',
  update_calendar_event: 'Update Calendar Event',
  store_sensitive_memory: 'Store Sensitive Memory',
};

interface Props {
  approval: Approval;
  onRefresh: () => void;
}

export default function ApprovalItem({ approval, onRefresh }: Props) {
  const [processing, setProcessing] = useState(false);

  const handle = async (action: 'approve' | 'reject') => {
    setProcessing(true);
    await apiFetch(`/api/approvals/${approval.id}/${action}`, { method: 'POST', body: '{}' });
    setProcessing(false);
    onRefresh();
  };

  const payloadSummary = (() => {
    const p = approval.payload;
    if (approval.actionType === 'send_email') {
      return `Subject: ${p.subject ?? '—'}  •  To: ${(p.to ?? []).join(', ')}`;
    }
    if (approval.actionType === 'create_calendar_event') {
      return `${p.title ?? '—'}  •  ${p.startTime ?? ''}`;
    }
    return JSON.stringify(p).slice(0, 120);
  })();

  return (
    <div className={styles.item}>
      <div className={styles.top}>
        <span className={styles.actionLabel}>{ACTION_LABELS[approval.actionType] ?? approval.actionType}</span>
        <span className={styles.date}>
          {approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : ''}
        </span>
      </div>
      <p className={styles.summary}>{payloadSummary}</p>
      <div className={styles.btns}>
        <button
          className={`${styles.btn} ${styles.approve}`}
          onClick={() => handle('approve')}
          disabled={processing}
        >
          {processing ? '…' : 'Approve'}
        </button>
        <button
          className={`${styles.btn} ${styles.reject}`}
          onClick={() => handle('reject')}
          disabled={processing}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

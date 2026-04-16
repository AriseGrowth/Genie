'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import styles from './ToolResultCard.module.css';
import type { Task, EmailDraft, MeetingSummary, TodayBrief, Approval } from '../../types';
import SearchResultCard from './SearchResultCard';
import FilePreviewCard from './FilePreviewCard';

interface Props {
  toolName: string;
  result: any;
  onAction?: () => void;
}

export default function ToolResultCard({ toolName, result, onAction }: Props) {
  switch (toolName) {
    case 'create_task':
      return <TaskCard task={result as Task} />;
    case 'create_email_draft':
      return <DraftCard draft={result as EmailDraft} onAction={onAction} />;
    case 'get_today_brief':
      return <BriefCard brief={result as TodayBrief} />;
    case 'summarize_meeting_text':
      return <MeetingCard summary={result as MeetingSummary} onAction={onAction} />;
    case 'request_approval':
      return <ApprovalCard approval={result as Approval} onAction={onAction} />;
    case 'search_web':
      return <SearchResultCard query={result?.query ?? ''} results={result?.results ?? []} />;
    case 'list_drive_files':
      return <DriveFilesCard files={result ?? []} />;
    case 'create_drive_document':
      return <FilePreviewCard file={{ name: result?.name ?? 'Document', type: 'application/vnd.google-apps.document', url: result?.webViewLink }} />;
    default:
      return (
        <div className={styles.card}>
          <pre className={styles.raw}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      );
  }
}

function TaskCard({ task }: { task: Task }) {
  const priorityClass = styles[`priority_${task.priority}`] ?? '';
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Task created</span>
        <span className={`${styles.badge} ${priorityClass}`}>{task.priority}</span>
      </div>
      <p className={styles.cardTitle}>{task.title}</p>
      {task.notes && <p className={styles.cardMeta}>{task.notes}</p>}
      {task.dueAt && (
        <p className={styles.cardMeta}>Due: {new Date(task.dueAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}

function DraftCard({ draft, onAction }: { draft: EmailDraft; onAction?: () => void }) {
  const [requesting, setRequesting] = useState(false);
  const { workspaceKind } = useWorkspace();

  const requestSend = async () => {
    setRequesting(true);
    await apiFetch(`/api/drafts/${draft.id}/request-send`, {
      method: 'POST',
      body: JSON.stringify({ workspaceKind }),
    });
    setRequesting(false);
    onAction?.();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Email draft</span>
        <span className={styles.badge}>{draft.status}</span>
      </div>
      <p className={styles.cardTitle}>{draft.subject}</p>
      <p className={styles.cardMeta}>To: {draft.to.join(', ')}</p>
      <p className={styles.cardBody}>{draft.body.slice(0, 200)}{draft.body.length > 200 ? '…' : ''}</p>
      {draft.status === 'draft' && (
        <button className={styles.actionBtn} onClick={requestSend} disabled={requesting}>
          {requesting ? 'Requesting…' : 'Request Send'}
        </button>
      )}
    </div>
  );
}

function BriefCard({ brief }: { brief: TodayBrief }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Today's Brief</span>
        <span className={styles.cardMeta}>{brief.date}</span>
      </div>
      {brief.topPriorities.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Priorities</p>
          <ol className={styles.list}>
            {brief.topPriorities.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </div>
      )}
      {brief.recommendedNextAction && (
        <div className={styles.cta}>{brief.recommendedNextAction}</div>
      )}
    </div>
  );
}

function MeetingCard({ summary, onAction }: { summary: MeetingSummary; onAction?: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const { workspaceKind } = useWorkspace();

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const createTasks = async () => {
    setCreating(true);
    const items = summary.actionItems.filter(a => selected.has(a.id));
    await Promise.all(items.map(item =>
      apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ workspaceKind, title: item.title, dueAt: item.dueAt }),
      })
    ));
    setCreating(false);
    onAction?.();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Meeting Summary</span>
      </div>
      <p className={styles.cardBody}>{summary.summary}</p>
      {summary.decisions.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Decisions</p>
          <ul className={styles.list}>
            {summary.decisions.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
      {summary.actionItems.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Action Items</p>
          {summary.actionItems.map(item => (
            <label key={item.id} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
              />
              <span>{item.title}</span>
              {item.owner && <span className={styles.owner}>{item.owner}</span>}
            </label>
          ))}
          {selected.size > 0 && (
            <button className={styles.actionBtn} onClick={createTasks} disabled={creating}>
              {creating ? 'Creating…' : `Create ${selected.size} task(s)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DriveFilesCard({ files }: { files: any[] }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Google Drive</span>
        <span className={styles.cardMeta}>{files.length} file(s)</span>
      </div>
      {files.length === 0 ? (
        <p className={styles.cardMeta}>No files found — Google Drive may not be connected yet.</p>
      ) : (
        <div className={styles.list}>
          {files.map((f: any, i: number) => (
            <a key={i} href={f.webViewLink} target="_blank" rel="noopener noreferrer" className={styles.checkRow}>
              <span>📄</span>
              <span>{f.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ approval, onAction }: { approval: Approval; onAction?: () => void }) {
  const [processing, setProcessing] = useState(false);

  const handle = async (action: 'approve' | 'reject') => {
    setProcessing(true);
    await apiFetch(`/api/approvals/${approval.id}/${action}`, { method: 'POST', body: '{}' });
    setProcessing(false);
    onAction?.();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Approval requested</span>
        <span className={styles.badge}>{approval.actionType.replace(/_/g, ' ')}</span>
      </div>
      <p className={styles.cardMeta}>{JSON.stringify(approval.payload).slice(0, 120)}</p>
      <div className={styles.btnRow}>
        <button className={`${styles.actionBtn} ${styles.approveBtn}`} onClick={() => handle('approve')} disabled={processing}>
          Approve
        </button>
        <button className={`${styles.actionBtn} ${styles.rejectBtn}`} onClick={() => handle('reject')} disabled={processing}>
          Reject
        </button>
      </div>
    </div>
  );
}

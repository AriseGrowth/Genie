'use client';

import { useState } from 'react';
import { useTasks } from '../../lib/hooks';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import TaskItem from './TaskItem';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBanner from '../ui/ErrorBanner';
import styles from './TaskList.module.css';

export default function TaskList() {
  const { data: tasks, loading, error, refetch } = useTasks('open');
  const { workspaceKind } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [dueAt, setDueAt] = useState('');
  const [creating, setCreating] = useState(false);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ workspaceKind, title: title.trim(), priority, dueAt: dueAt || undefined }),
    });
    setTitle('');
    setDueAt('');
    setPriority('normal');
    setShowForm(false);
    setCreating(false);
    refetch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Tasks</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={createTask}>
          <input
            className={styles.input}
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
          <div className={styles.formRow}>
            <select
              className={styles.select}
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              className={styles.input}
              type="date"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
            />
            <button className={styles.submitBtn} type="submit" disabled={creating}>
              {creating ? '…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {loading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && (
        <div className={styles.list}>
          {tasks?.length === 0 ? (
            <p className={styles.empty}>No open tasks. Ask Genie to create one!</p>
          ) : (
            tasks?.map(task => (
              <TaskItem key={task.id} task={task} onComplete={refetch} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { apiFetch } from '../../lib/apiFetch';
import styles from './TaskItem.module.css';
import type { Task } from '../../types';

interface Props {
  task: Task;
  onComplete: () => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export default function TaskItem({ task, onComplete }: Props) {
  const handleComplete = async () => {
    await apiFetch(`/api/tasks/${task.id}/complete`, { method: 'POST', body: '{}' });
    onComplete();
  };

  return (
    <div className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        onChange={handleComplete}
        title="Mark as done"
      />
      <div className={styles.body}>
        <p className={styles.title}>{task.title}</p>
        {task.notes && <p className={styles.notes}>{task.notes}</p>}
        <div className={styles.meta}>
          <span className={`${styles.priority} ${styles[`p_${task.priority}`]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.dueAt && (
            <span className={styles.due}>
              Due {new Date(task.dueAt).toLocaleDateString()}
            </span>
          )}
          <span className={styles.source}>{task.source}</span>
        </div>
      </div>
    </div>
  );
}

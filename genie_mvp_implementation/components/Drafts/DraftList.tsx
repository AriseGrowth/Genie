'use client';

import { useDrafts } from '../../lib/hooks';
import DraftCard from './DraftCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBanner from '../ui/ErrorBanner';
import styles from './DraftList.module.css';

export default function DraftList() {
  const { data: drafts, loading, error, refetch } = useDrafts();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Email Drafts</h2>
      </div>
      {loading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && (
        <div className={styles.list}>
          {drafts?.length === 0 ? (
            <p className={styles.empty}>No drafts yet. Ask Genie to draft an email!</p>
          ) : (
            drafts?.map(draft => (
              <DraftCard key={draft.id} draft={draft} onRefresh={refetch} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

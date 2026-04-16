'use client';

import { useApprovals } from '../../lib/hooks';
import ApprovalItem from './ApprovalItem';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBanner from '../ui/ErrorBanner';
import styles from './ApprovalQueue.module.css';

export default function ApprovalQueue() {
  const { data: approvals, loading, error, refetch } = useApprovals();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Approvals</h2>
        {approvals && approvals.length > 0 && (
          <span className={styles.count}>{approvals.length} pending</span>
        )}
      </div>
      {loading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && (
        <div className={styles.list}>
          {approvals?.length === 0 ? (
            <p className={styles.empty}>No pending approvals.</p>
          ) : (
            approvals?.map(approval => (
              <ApprovalItem key={approval.id} approval={approval} onRefresh={refetch} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

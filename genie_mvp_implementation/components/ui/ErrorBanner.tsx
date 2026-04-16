'use client';

import styles from './ErrorBanner.module.css';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className={styles.banner}>
      <span>{message}</span>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

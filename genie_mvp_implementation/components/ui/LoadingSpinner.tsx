'use client';

import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ fullscreen = false }: { fullscreen?: boolean }) {
  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.spinner} />
      </div>
    );
  }
  return <div className={styles.spinner} />;
}

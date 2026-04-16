'use client';

import styles from './GoogleConnect.module.css';

interface Props {
  service: 'drive' | 'calendar' | 'gmail' | 'tasks';
  label: string;
  icon: string;
  connected?: boolean;
  accountEmail?: string;
}

const DESCRIPTIONS: Record<string, string> = {
  drive: 'Access and create Google Drive files',
  calendar: 'Read and schedule calendar events',
  gmail: 'Read and send emails via Gmail',
  tasks: 'Sync tasks with Google Tasks',
};

export default function GoogleConnect({ service, label, icon, connected = false, accountEmail }: Props) {
  const handleConnect = () => {
    window.location.href = `/api/google/auth?service=${service}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <span className={styles.icon}>{icon}</span>
        <div>
          <div className={styles.label}>{label}</div>
          <div className={styles.desc}>{DESCRIPTIONS[service]}</div>
          {connected && accountEmail && (
            <div className={styles.email}>{accountEmail}</div>
          )}
        </div>
      </div>
      <div className={styles.cardRight}>
        <span className={`${styles.badge} ${connected ? styles.connected : styles.disconnected}`}>
          {connected ? 'Connected' : 'Not connected'}
        </span>
        <button
          className={`${styles.btn} ${connected ? styles.disconnectBtn : styles.connectBtn}`}
          onClick={connected ? undefined : handleConnect}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

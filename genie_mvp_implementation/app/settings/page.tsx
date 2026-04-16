'use client';

import { useSearchParams } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import GoogleConnect from '../../components/Settings/GoogleConnect';
import styles from './settings.module.css';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const params = useSearchParams();
  const connected = params.get('connected');
  const error = params.get('error');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Connect your accounts to unlock Genie's full powers</p>
        </div>

        {connected && (
          <div className={styles.successBanner}>
            ✓ {connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully
          </div>
        )}
        {error && (
          <div className={styles.errorBanner}>
            {error === 'not_configured'
              ? 'Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.'
              : error === 'oauth_cancelled'
              ? 'OAuth was cancelled.'
              : `Error: ${error}`}
          </div>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Connected Accounts</h2>
          <div className={styles.cards}>
            <GoogleConnect service="drive" label="Google Drive" icon="📂" />
            <GoogleConnect service="calendar" label="Google Calendar" icon="📅" />
            <GoogleConnect service="gmail" label="Gmail" icon="✉️" />
            <GoogleConnect service="tasks" label="Google Tasks" icon="✅" />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About Genie</h2>
          <div className={styles.aboutCard}>
            <div className={styles.aboutOrb}>✦</div>
            <div>
              <p className={styles.aboutText}>
                Genie is your AI executive assistant — powered by GPT-4o, with voice, task management, email drafting, and calendar control.
              </p>
              <p className={styles.aboutNote}>
                Connect your Google accounts above to enable calendar sync, Gmail drafting, Drive access, and Tasks integration.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

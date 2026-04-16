'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../../lib/UserContext';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { supabase } from '../../lib/supabaseClient';
import styles from './Nav.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/today', label: 'Today' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/drafts', label: 'Drafts' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/meetings', label: 'Meetings' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const { session } = useUser();
  const { workspaceKind, setWorkspaceKind } = useWorkspace();
  const pathname = usePathname();

  if (!session || pathname === '/auth/login') return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>✦</span>
        <span className={styles.brandName}>Genie</span>
      </div>

      <div className={styles.links}>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${pathname === href ? styles.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className={styles.right}>
        <div className={styles.workspaceSwitcher}>
          <button
            className={`${styles.wsBtn} ${workspaceKind === 'personal' ? styles.wsActive : ''}`}
            onClick={() => setWorkspaceKind('personal')}
          >
            Personal
          </button>
          <button
            className={`${styles.wsBtn} ${workspaceKind === 'business' ? styles.wsActive : ''}`}
            onClick={() => setWorkspaceKind('business')}
          >
            Business
          </button>
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

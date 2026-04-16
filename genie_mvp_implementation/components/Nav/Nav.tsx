'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../../lib/UserContext';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { useGenie } from '../../lib/GenieContext';
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
  const { pendingApprovals } = useGenie();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* Desktop links */}
      <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${pathname === href ? styles.active : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
            {label === 'Approvals' && pendingApprovals > 0 && (
              <span className={styles.navBadge}>
                {pendingApprovals > 9 ? '9+' : pendingApprovals}
              </span>
            )}
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

        {/* Hamburger — mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hbar} ${menuOpen ? styles.hbar1Open : ''}`} />
          <span className={`${styles.hbar} ${menuOpen ? styles.hbar2Open : ''}`} />
          <span className={`${styles.hbar} ${menuOpen ? styles.hbar3Open : ''}`} />
        </button>
      </div>
    </nav>
  );
}

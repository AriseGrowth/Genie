'use client';

import { useGenie } from '../../lib/GenieContext';
import styles from './GenieOrb.module.css';

export default function GenieOrb() {
  const { genieState, toggleOpen, isOpen, pendingApprovals } = useGenie();

  return (
    <div
      className={`${styles.orb} ${styles[genieState]} ${isOpen ? styles.open : ''}`}
      onClick={toggleOpen}
      role="button"
      aria-label="Open Genie"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && toggleOpen()}
    >
      {/* Ripple rings shown during listening */}
      {genieState === 'listening' && (
        <>
          <div className={styles.ripple} />
          <div className={`${styles.ripple} ${styles.ripple2}`} />
        </>
      )}

      {/* Spinning ring shown during thinking */}
      {genieState === 'thinking' && <div className={styles.spinRing} />}

      {/* Core orb body */}
      <div className={styles.core}>
        <svg
          viewBox="0 0 64 64"
          className={styles.face}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Genie face elements */}
          <ellipse cx="22" cy="26" rx="4" ry="5" fill="rgba(255,255,255,0.9)" className={styles.eyeWhite} />
          <ellipse cx="42" cy="26" rx="4" ry="5" fill="rgba(255,255,255,0.9)" className={styles.eyeWhite} />
          <circle cx="22" cy="27" r="2.5" fill="#1a1a2e" className={styles.pupil} />
          <circle cx="42" cy="27" r="2.5" fill="#1a1a2e" className={styles.pupil} />
          <circle cx="23" cy="26" r="0.8" fill="white" />
          <circle cx="43" cy="26" r="0.8" fill="white" />
          {/* Smile */}
          <path
            d={genieState === 'speaking' ? 'M 22 38 Q 32 46 42 38' : 'M 22 38 Q 32 44 42 38'}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Star sparkle */}
          <text x="28" y="18" fontSize="8" textAnchor="middle" fill="var(--color-genie-gold)" opacity="0.9">✦</text>
        </svg>
      </div>

      {/* Smoke wisps */}
      <div className={styles.smokesWrap}>
        <div className={`${styles.smoke} ${styles.smoke1}`} />
        <div className={`${styles.smoke} ${styles.smoke2}`} />
        <div className={`${styles.smoke} ${styles.smoke3}`} />
      </div>

      {/* Pending approval badge */}
      {pendingApprovals > 0 && (
        <div className={styles.badge}>{pendingApprovals > 9 ? '9+' : pendingApprovals}</div>
      )}

      {/* Speaking wave bars */}
      {genieState === 'speaking' && (
        <div className={styles.waveBars}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={styles.bar} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

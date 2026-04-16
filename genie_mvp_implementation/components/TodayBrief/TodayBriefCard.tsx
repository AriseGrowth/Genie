'use client';

import { useTodayBrief } from '../../lib/hooks';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBanner from '../ui/ErrorBanner';
import styles from './TodayBriefCard.module.css';

export default function TodayBriefCard() {
  const { data: brief, loading, error, refetch } = useTodayBrief();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={refetch} />;
  if (!brief) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Today's Brief</h2>
        <span className={styles.date}>{brief.date}</span>
      </div>

      {brief.topPriorities.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Top Priorities</h3>
          <ol className={styles.priorityList}>
            {brief.topPriorities.map((p, i) => (
              <li key={i} className={styles.priorityItem}>{p}</li>
            ))}
          </ol>
        </section>
      )}

      {brief.keyEvents.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Events</h3>
          <div className={styles.eventList}>
            {brief.keyEvents.map((ev, i) => (
              <div key={i} className={styles.event}>
                <span className={styles.eventTime}>
                  {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={styles.eventTitle}>{ev.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {brief.openTasks.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Open Tasks</h3>
          <ul className={styles.taskList}>
            {brief.openTasks.map(task => (
              <li key={task.id} className={styles.taskItem}>
                <span className={styles.taskDot} />
                <span>{task.title}</span>
                {task.dueAt && (
                  <span className={styles.taskDue}>
                    {new Date(task.dueAt).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.risks.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Risks</h3>
          {brief.risks.map((risk, i) => (
            <div key={i} className={styles.risk}>{risk}</div>
          ))}
        </section>
      )}

      {brief.recommendedNextAction && (
        <div className={styles.cta}>
          <span className={styles.ctaLabel}>Recommended next action</span>
          <p className={styles.ctaText}>{brief.recommendedNextAction}</p>
        </div>
      )}
    </div>
  );
}

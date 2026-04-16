'use client';

import styles from './SearchResultCard.module.css';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface Props {
  query: string;
  results: SearchResult[];
}

export default function SearchResultCard({ query, results }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Web Search</span>
        <span className={styles.query}>"{query}"</span>
      </div>
      {results.length === 0 ? (
        <p className={styles.empty}>No results found.</p>
      ) : (
        <div className={styles.results}>
          {results.slice(0, 5).map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.result}
            >
              <div className={styles.resultTop}>
                {r.favicon && (
                  <img src={r.favicon} alt="" className={styles.favicon} width={14} height={14} />
                )}
                <span className={styles.resultTitle}>{r.title}</span>
              </div>
              <span className={styles.resultUrl}>{r.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
              <p className={styles.resultSnippet}>{r.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

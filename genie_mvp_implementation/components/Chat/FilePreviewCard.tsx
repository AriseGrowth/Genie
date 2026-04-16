'use client';

import styles from './FilePreviewCard.module.css';

interface FileResult {
  name: string;
  type: string;
  url?: string;
  content?: string;
  size?: number;
}

interface Props {
  file: FileResult;
}

function fileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type === 'text/csv') return '📊';
  return '📎';
}

export default function FilePreviewCard({ file }: Props) {
  const icon = fileIcon(file.type);
  const isImage = file.type.startsWith('image/') && file.url;

  const handleDownload = () => {
    if (!file.url && !file.content) return;
    const blob = file.content
      ? new Blob([file.content], { type: file.type || 'text/plain' })
      : null;
    const url = blob ? URL.createObjectURL(blob) : file.url!;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    if (blob) URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.label}>File</span>
      </div>
      {isImage && (
        <img src={file.url} alt={file.name} className={styles.thumb} />
      )}
      <div className={styles.row}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.meta}>
          <span className={styles.name}>{file.name}</span>
          {file.size && (
            <span className={styles.size}>{(file.size / 1024).toFixed(1)} KB</span>
          )}
        </div>
        {(file.url || file.content) && (
          <button className={styles.downloadBtn} onClick={handleDownload}>
            ↓ Download
          </button>
        )}
      </div>
    </div>
  );
}

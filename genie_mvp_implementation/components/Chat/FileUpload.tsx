'use client';

import { useRef } from 'react';
import styles from './FileUpload.module.css';

interface AttachedFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

interface Props {
  onFile: (file: AttachedFile) => void;
}

const ACCEPTED = '.pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.md';

export default function FileUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFile({ name: file.name, type: file.type, base64, size: file.size });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className={styles.hidden}
        onChange={handleChange}
      />
      <button
        className={styles.btn}
        onClick={() => inputRef.current?.click()}
        aria-label="Attach file"
        title="Attach file"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
    </>
  );
}

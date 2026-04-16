'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import styles from './ChatInput.module.css';

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
  workspace: string;
}

export default function ChatInput({ onSend, loading, workspace }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>{workspace}</div>
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Genie… (Enter to send, Shift+Enter for newline)"
          disabled={loading}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!value.trim() || loading}
        >
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  );
}

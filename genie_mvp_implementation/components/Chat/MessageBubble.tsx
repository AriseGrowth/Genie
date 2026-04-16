'use client';

import styles from './MessageBubble.module.css';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}>
      {!isUser && <div className={styles.avatar}>✦</div>}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        <p className={styles.content}>{message.content}</p>
        <span className={styles.time}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import ChatInput from './ChatInput';
import MessageBubble, { ChatMessage } from './MessageBubble';
import ToolResultCard from './ToolResultCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './ChatWindow.module.css';

interface DisplayItem {
  id: string;
  type: 'message' | 'tool';
  message?: ChatMessage;
  toolName?: string;
  toolResult?: any;
}

export default function ChatWindow() {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { workspaceKind } = useWorkspace();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  const handleSend = async (message: string) => {
    const userItem: DisplayItem = {
      id: crypto.randomUUID(),
      type: 'message',
      message: { id: crypto.randomUUID(), role: 'user', content: message, timestamp: new Date() },
    };
    setItems(prev => [...prev, userItem]);
    setLoading(true);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ workspaceKind, message, conversationId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      if (data.conversationId) setConversationId(data.conversationId);

      if (data.type === 'assistant') {
        setItems(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'message',
          message: { id: crypto.randomUUID(), role: 'assistant', content: data.content, timestamp: new Date() },
        }]);
      } else if (data.type === 'tool') {
        setItems(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'tool',
          toolName: data.name,
          toolResult: data.result,
        }]);
      }
    } catch (err: any) {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'message',
        message: { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() },
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.window}>
      <div className={styles.messages}>
        {items.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✦</span>
            <p>How can I help you today?</p>
          </div>
        )}
        {items.map(item =>
          item.type === 'message' && item.message ? (
            <MessageBubble key={item.id} message={item.message} />
          ) : (
            <ToolResultCard key={item.id} toolName={item.toolName!} result={item.toolResult} />
          )
        )}
        {loading && (
          <div className={styles.loadingRow}>
            <div className={styles.avatar}>✦</div>
            <LoadingSpinner />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} loading={loading} workspace={workspaceKind} />
    </div>
  );
}

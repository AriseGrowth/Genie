'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGenie } from '../../lib/GenieContext';
import { apiFetch } from '../../lib/apiFetch';
import { useWorkspace } from '../../lib/WorkspaceContext';
import MessageBubble, { ChatMessage } from '../Chat/MessageBubble';
import ToolResultCard from '../Chat/ToolResultCard';
import VoiceButton from '../Voice/VoiceButton';
import FileUpload from '../Chat/FileUpload';
import styles from './GeniePanel.module.css';

interface DisplayItem {
  id: string;
  type: 'message' | 'tool';
  message?: ChatMessage;
  toolName?: string;
  toolResult?: any;
}

interface AttachedFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

interface GeniePanelProps {
  onSpeakText?: (text: string) => void;
}

export default function GeniePanel({ onSpeakText }: GeniePanelProps) {
  const { isOpen, setOpen, setGenieState } = useGenie();
  const { workspaceKind } = useWorkspace();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  useEffect(() => {
    if (isOpen && items.length === 0) {
      // Greeting on first open
      setItems([{
        id: 'greeting',
        type: 'message',
        message: {
          id: 'greeting',
          role: 'assistant',
          content: "Your wish is my command. How can I help you today?",
          timestamp: new Date(),
        }
      }]);
    }
  }, [isOpen]);

  const handleSend = useCallback(async (messageOverride?: string) => {
    const text = (messageOverride ?? value).trim();
    if (!text || loading) return;

    const userContent = attachedFile
      ? `${text}\n\n[Attached file: ${attachedFile.name}]`
      : text;

    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'message',
      message: { id: crypto.randomUUID(), role: 'user', content: userContent, timestamp: new Date() },
    }]);
    setValue('');
    setAttachedFile(null);
    setLoading(true);
    setGenieState('thinking');

    try {
      const body: any = { workspaceKind, message: text, conversationId };
      if (attachedFile) body.fileAttachment = attachedFile;

      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      if (data.conversationId) setConversationId(data.conversationId);

      if (data.type === 'assistant') {
        const msg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.content, timestamp: new Date() };
        setItems(prev => [...prev, { id: crypto.randomUUID(), type: 'message', message: msg }]);
        setGenieState('speaking');
        onSpeakText?.(data.content);
        setTimeout(() => setGenieState('idle'), 3000);
      } else if (data.type === 'tool') {
        setItems(prev => [...prev, { id: crypto.randomUUID(), type: 'tool', toolName: data.name, toolResult: data.result }]);
        setGenieState('idle');
      }
    } catch (err: any) {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'message',
        message: { id: crypto.randomUUID(), role: 'assistant', content: `Something went wrong: ${err.message}`, timestamp: new Date() },
      }]);
      setGenieState('idle');
    } finally {
      setLoading(false);
    }
  }, [value, loading, workspaceKind, conversationId, attachedFile, setGenieState, onSpeakText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  const handleVoiceResult = (transcript: string) => {
    setValue(transcript);
    handleSend(transcript);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.miniOrb} />
          <div>
            <div className={styles.name}>Genie</div>
            <div className={styles.status}>
              {loading ? 'Thinking…' : 'Ready'}
            </div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {items.map(item =>
          item.type === 'message' && item.message ? (
            <MessageBubble key={item.id} message={item.message} />
          ) : (
            <ToolResultCard key={item.id} toolName={item.toolName!} result={item.toolResult} />
          )
        )}
        {loading && (
          <div className={styles.loadingRow}>
            <div className={styles.thinkingDots}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attached file preview */}
      {attachedFile && (
        <div className={styles.fileChip}>
          <span>📎 {attachedFile.name}</span>
          <button onClick={() => setAttachedFile(null)}>✕</button>
        </div>
      )}

      {/* Input footer */}
      <div className={styles.footer}>
        <div className={styles.inputRow}>
          <FileUpload onFile={setAttachedFile} />
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Your wish…"
            disabled={loading}
            rows={1}
          />
          <VoiceButton onResult={handleVoiceResult} loading={loading} />
          <button
            className={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={!value.trim() || loading}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

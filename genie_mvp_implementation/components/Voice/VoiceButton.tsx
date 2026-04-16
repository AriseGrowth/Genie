'use client';

import { useGenie } from '../../lib/GenieContext';
import { useVoice } from '../../lib/useVoice';
import styles from './VoiceButton.module.css';

interface Props {
  onResult: (transcript: string) => void;
  loading: boolean;
}

export default function VoiceButton({ onResult, loading }: Props) {
  const { setGenieState } = useGenie();

  const { isListening, supported, startListening, stopListening } = useVoice((transcript) => {
    setGenieState('idle');
    onResult(transcript);
  });

  if (!supported) return null;

  const toggle = () => {
    if (loading) return;
    if (isListening) {
      stopListening();
      setGenieState('idle');
    } else {
      startListening();
      setGenieState('listening');
    }
  };

  return (
    <button
      className={`${styles.btn} ${isListening ? styles.active : ''}`}
      onClick={toggle}
      disabled={loading}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      title={isListening ? 'Stop' : 'Speak'}
    >
      {isListening ? (
        <span className={styles.dot} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      )}
    </button>
  );
}

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GenieState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface GenieCtx {
  isOpen: boolean;
  genieState: GenieState;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;
  setGenieState: (s: GenieState) => void;
}

const GenieContext = createContext<GenieCtx | null>(null);

export function GenieProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [genieState, setGenieState] = useState<GenieState>('idle');

  const setOpen = useCallback((v: boolean) => setIsOpen(v), []);
  const toggleOpen = useCallback(() => setIsOpen(p => !p), []);

  return (
    <GenieContext.Provider value={{ isOpen, genieState, setOpen, toggleOpen, setGenieState }}>
      {children}
    </GenieContext.Provider>
  );
}

export function useGenie() {
  const ctx = useContext(GenieContext);
  if (!ctx) throw new Error('useGenie must be used inside GenieProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GenieState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface GenieCtx {
  isOpen: boolean;
  genieState: GenieState;
  pendingApprovals: number;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;
  setGenieState: (s: GenieState) => void;
  setPendingApprovals: (n: number) => void;
}

const GenieContext = createContext<GenieCtx | null>(null);

export function GenieProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [genieState, setGenieState] = useState<GenieState>('idle');
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const setOpen = useCallback((v: boolean) => setIsOpen(v), []);
  const toggleOpen = useCallback(() => setIsOpen(p => !p), []);

  return (
    <GenieContext.Provider value={{ isOpen, genieState, pendingApprovals, setOpen, toggleOpen, setGenieState, setPendingApprovals }}>
      {children}
    </GenieContext.Provider>
  );
}

export function useGenie() {
  const ctx = useContext(GenieContext);
  if (!ctx) throw new Error('useGenie must be used inside GenieProvider');
  return ctx;
}

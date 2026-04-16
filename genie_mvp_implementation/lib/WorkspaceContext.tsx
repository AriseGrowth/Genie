'use client';

import { createContext, useContext, useState } from 'react';
import type { WorkspaceKind } from '../types';

interface WorkspaceCtx {
  workspaceKind: WorkspaceKind;
  setWorkspaceKind: (k: WorkspaceKind) => void;
}

const WorkspaceContext = createContext<WorkspaceCtx>({
  workspaceKind: 'personal',
  setWorkspaceKind: () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceKind, setWorkspaceKind] = useState<WorkspaceKind>('personal');
  return (
    <WorkspaceContext.Provider value={{ workspaceKind, setWorkspaceKind }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);

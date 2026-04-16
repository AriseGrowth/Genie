'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './apiFetch';
import { useWorkspace } from './WorkspaceContext';
import { useUser } from './UserContext';
import type { Task, EmailDraft, Approval, TodayBrief } from '../types';

interface HookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTasks(status = 'open'): HookResult<Task[]> {
  const { workspaceKind } = useWorkspace();
  const { session } = useUser();
  const [data, setData] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/tasks?workspaceKind=${workspaceKind}&status=${status}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load tasks');
      setData(json.tasks);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceKind, status, session]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useDrafts(): HookResult<EmailDraft[]> {
  const { workspaceKind } = useWorkspace();
  const { session } = useUser();
  const [data, setData] = useState<EmailDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/drafts?workspaceKind=${workspaceKind}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load drafts');
      setData(json.drafts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceKind, session]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useApprovals(): HookResult<Approval[]> {
  const { workspaceKind } = useWorkspace();
  const { session } = useUser();
  const [data, setData] = useState<Approval[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/approvals?workspaceKind=${workspaceKind}&status=pending`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load approvals');
      setData(json.approvals);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceKind, session]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useTodayBrief(): HookResult<TodayBrief> {
  const { workspaceKind } = useWorkspace();
  const { session } = useUser();
  const [data, setData] = useState<TodayBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/today?workspaceKind=${workspaceKind}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load brief');
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceKind, session]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

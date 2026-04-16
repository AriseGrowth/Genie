'use client';

import { useEffect } from 'react';
import { useUser } from '../../lib/UserContext';
import { useGenie } from '../../lib/GenieContext';
import { apiFetch } from '../../lib/apiFetch';

const POLL_INTERVAL = 30_000;

export default function ApprovalPoller() {
  const { session } = useUser();
  const { setPendingApprovals } = useGenie();

  useEffect(() => {
    if (!session) return;

    const poll = async () => {
      try {
        const [personalRes, businessRes] = await Promise.all([
          apiFetch('/api/approvals?workspaceKind=personal&status=pending'),
          apiFetch('/api/approvals?workspaceKind=business&status=pending'),
        ]);
        const [personal, business] = await Promise.all([
          personalRes.ok ? personalRes.json() : { approvals: [] },
          businessRes.ok ? businessRes.json() : { approvals: [] },
        ]);
        setPendingApprovals(
          (personal.approvals?.length ?? 0) + (business.approvals?.length ?? 0)
        );
      } catch {
        // silently ignore
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [session, setPendingApprovals]);

  return null;
}

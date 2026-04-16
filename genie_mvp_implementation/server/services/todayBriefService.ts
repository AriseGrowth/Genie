import { TodayBrief, WorkspaceKind } from '../../types';
import { fetchEvents } from '../integrations/googleCalendar';
import { listOpenTasks } from '../integrations/googleTasks';
import { supabase } from '../integrations/supabase';

/**
 * todayBriefService
 *
 * Aggregates events, open tasks and basic risk analysis to build a
 * TodayBrief payload. This implementation is simplified; in a real
 * system you would pull data from Supabase as well as external
 * integrations and perform richer analysis (e.g. overlapping events
 * detection, follow‑up reminders, etc.).
 */

export async function buildTodayBrief(userId: string, workspaceKind: WorkspaceKind): Promise<TodayBrief> {
  // Determine the date range for "today" based on user's timezone. Here we
  // simply use UTC; you may want to pass the timezone explicitly.
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dateFrom = new Date(dateStr + 'T00:00:00Z');
  const dateTo = new Date(dateStr + 'T23:59:59Z');

  // Fetch calendar events (stubbed).
  const events = await fetchEvents(userId, `${userId}-${workspaceKind}`, dateFrom.toISOString(), dateTo.toISOString());

  // Fetch open tasks (stubbed). In a real implementation you would
  // fetch from Supabase as well; we rely on Google Tasks stub here.
  const tasks = await listOpenTasks(userId);

  // Build simple risks: overdue tasks are tasks with due dates in the past.
  const overdue = tasks.filter((t: any) => t.dueAt && new Date(t.dueAt) < today);
  const risks: string[] = [];
  if (overdue.length > 0) {
    risks.push(`There are ${overdue.length} overdue task(s)`);
  }
  if (events.length === 0 && tasks.length === 0) {
    risks.push('Your day looks empty');
  }

  const topPriorities: string[] = [];
  // Determine top priorities based on tasks and events. This is a placeholder.
  if (events.length > 0) {
    topPriorities.push('Prepare for your upcoming meeting');
  }
  if (tasks.length > 0) {
    topPriorities.push('Complete your highest priority task');
  }
  if (topPriorities.length === 0) {
    topPriorities.push('Focus on strategic thinking today');
  }

  return {
    date: dateStr,
    workspaceKind,
    topPriorities,
    keyEvents: events.map((e: any) => ({
      title: e.title || 'Event',
      start: e.start || '',
      end: e.end || ''
    })),
    openTasks: tasks.map((t: any) => ({
      id: t.id || 'task-id',
      title: t.title || '',
      dueAt: t.dueAt,
      priority: t.priority
    })),
    risks,
    recommendedNextAction: topPriorities[0]
  };
}
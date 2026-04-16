import { TodayBrief, WorkspaceKind } from '../../types';
import { fetchEvents } from '../integrations/googleCalendar';
import { supabase } from '../integrations/supabase';
import { callOpenAI } from '../integrations/openai';

export async function buildTodayBrief(userId: string, workspaceKind: WorkspaceKind): Promise<TodayBrief> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dateFrom = new Date(dateStr + 'T00:00:00Z');
  const dateTo = new Date(dateStr + 'T23:59:59Z');

  const [events, dbTasksResult] = await Promise.all([
    fetchEvents(userId, `${userId}-${workspaceKind}`, dateFrom.toISOString(), dateTo.toISOString()),
    supabase
      .from('tasks')
      .select('id, title, due_at, priority')
      .eq('workspace_id', `${userId}-${workspaceKind}`)
      .eq('status', 'open')
      .order('due_at', { ascending: true })
      .limit(10),
  ]);

  const tasks = (dbTasksResult.data ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    dueAt: t.due_at,
    priority: t.priority,
  }));

  const overdue = tasks.filter((t: any) => t.dueAt && new Date(t.dueAt) < today);
  const risks: string[] = [];
  if (overdue.length > 0) risks.push(`${overdue.length} overdue task(s)`);
  if (events.length === 0 && tasks.length === 0) risks.push('Your day looks empty — great time for deep work');

  const { topPriorities, recommendedNextAction } = await generatePriorities(events, tasks, dateStr, workspaceKind);

  return {
    date: dateStr,
    workspaceKind,
    topPriorities,
    keyEvents: events.map((e: any) => ({
      title: e.title || 'Event',
      start: e.start || '',
      end: e.end || '',
    })),
    openTasks: tasks.map((t: any) => ({
      id: t.id || 'task-id',
      title: t.title || '',
      dueAt: t.dueAt,
      priority: t.priority,
    })),
    risks,
    recommendedNextAction,
  };
}

async function generatePriorities(
  events: any[],
  tasks: any[],
  dateStr: string,
  workspaceKind: string
): Promise<{ topPriorities: string[]; recommendedNextAction: string }> {
  if (events.length === 0 && tasks.length === 0) {
    return {
      topPriorities: ['Block time for deep strategic thinking', 'Review your long-term goals'],
      recommendedNextAction: 'Use the quiet day to work on your highest-leverage project.',
    };
  }

  try {
    const eventList = events.map((e: any) => `- ${e.title} at ${e.start}`).join('\n') || 'None';
    const taskList = tasks.map((t: any) =>
      `- ${t.title}${t.priority ? ` (${t.priority})` : ''}${t.dueAt ? `, due ${t.dueAt}` : ''}`
    ).join('\n') || 'None';

    const prompt = `Today is ${dateStr}. Workspace: ${workspaceKind}.

Calendar events today:
${eventList}

Open tasks:
${taskList}

Return a JSON object with:
- "topPriorities": array of 2-3 concise, actionable priority strings (max 10 words each)
- "recommendedNextAction": one sentence — the single most important thing to do right now

Be specific, not generic. Reference actual task/event names where relevant.`;

    const response = await callOpenAI({
      messages: [
        { role: 'system', content: 'You are a sharp executive assistant. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      jsonMode: true,
    });

    const content = response.choices[0].message?.content ?? '{}';
    const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(clean);

    return {
      topPriorities: Array.isArray(parsed.topPriorities) && parsed.topPriorities.length > 0
        ? parsed.topPriorities.slice(0, 3)
        : ['Complete your highest priority task'],
      recommendedNextAction: typeof parsed.recommendedNextAction === 'string'
        ? parsed.recommendedNextAction
        : 'Focus on the most urgent item on your list.',
    };
  } catch {
    const topTask = tasks.find(t => t.priority === 'urgent') ?? tasks.find(t => t.priority === 'high') ?? tasks[0];
    return {
      topPriorities: [
        ...(topTask ? [`Complete: ${topTask.title}`] : []),
        ...(events.length > 0 ? [`Prepare for: ${events[0].title}`] : []),
        'Review open items before end of day',
      ].slice(0, 3),
      recommendedNextAction: topTask
        ? `Start with "${topTask.title}" — it's your most urgent open task.`
        : 'Review your calendar and clear your most time-sensitive item.',
    };
  }
}

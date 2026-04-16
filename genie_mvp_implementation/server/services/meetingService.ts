import { MeetingSummary, ActionItem } from '../../types';
import { callOpenAI } from '../integrations/openai';
import { supabase } from '../integrations/supabase';

/**
 * meetingService
 *
 * Summarises meeting notes/transcripts and extracts structured
 * decisions and action items using the OpenAI Responses API. The
 * summarisation prompt is basic; you may refine it to better suit
 * your domain. Action items are returned with temporary ids; when
 * saving tasks these ids are mapped to persistent ids.
 */

export async function summariseMeetingText(userId: string, workspaceId: string, meetingText: string): Promise<MeetingSummary> {
  const systemPrompt = 'Summarise the following meeting notes. Return a JSON object with summary, decisions and action_items. Each action item should have a title, optional owner and optional due date.';
  const messages = [
    { role: 'system', content: systemPrompt } as const,
    { role: 'user', content: meetingText } as const
  ];
  const response = await callOpenAI({ messages, jsonMode: true });
  const content = response.choices[0].message?.content ?? '{}';
  let parsed: { summary: string; decisions: string[]; action_items: any[] };
  try {
    // Strip markdown code fences if present
    const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { summary: content, decisions: [], action_items: [] };
  }
  // Generate a temporary id for the meeting summary
  const summaryId = `ms-${Date.now()}`;
  const actionItems: ActionItem[] = parsed.action_items?.map((item: any, index: number) => ({
    id: `temp-${index}`,
    title: item.title,
    owner: item.owner,
    dueAt: item.due_date,
    status: 'open'
  })) || [];
  return {
    id: summaryId,
    title: 'Meeting Summary',
    summary: parsed.summary || '',
    decisions: parsed.decisions || [],
    actionItems,
    followupDraft: {
      subject: 'Follow-up on our meeting',
      body: 'Hi, here is a summary of our discussion and next steps.'
    }
  };
}

export async function createTasksFromActionItems(userId: string, workspaceId: string, summaryId: string, selectedItemIds: string[]) {
  // In a real implementation you would map temporary ids to the
  // action items saved in the meeting summary table, then create tasks
  // accordingly. Here we create placeholder tasks in Supabase.
  const tasks = [];
  for (const id of selectedItemIds) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        workspace_id: workspaceId,
        title: `Action item ${id}`,
        status: 'open'
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    tasks.push({ id: data.id, title: data.title, status: data.status });
  }
  return tasks;
}
import type OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { TOOL_DEFINITIONS } from '../prompts/toolDefinitions';
import { callOpenAI } from '../integrations/openai';
import { supabase } from '../integrations/supabase';
import { buildTodayBrief } from './todayBriefService';
import { createDraft as createEmailDraft } from './draftService';
import { createTask } from './taskService';
import { summariseMeetingText } from './meetingService';
import { createApproval } from './approvalService';
import { searchWeb } from '../integrations/webSearch';
import { listFiles as listDriveFiles, createDocument as createDriveDocument } from '../integrations/googleDrive';

export interface OrchestratorInput {
  userId: string;
  workspaceKind: 'personal' | 'business';
  conversationId?: string;
  message: string;
}

async function getOrCreateConversation(userId: string, workspaceId: string, conversationId?: string): Promise<string> {
  if (conversationId) return conversationId;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, workspace_id: workspaceId })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function loadHistory(conversationId: string): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const { data } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);
  return (data ?? []).map((m: any) => ({ role: m.role, content: m.content }));
}

async function saveMessages(conversationId: string, userContent: string, assistantContent: string) {
  await supabase.from('messages').insert([
    { conversation_id: conversationId, role: 'user', content: userContent },
    { conversation_id: conversationId, role: 'assistant', content: assistantContent },
  ]);
}

export async function orchestrate({ userId, workspaceKind, conversationId, message }: OrchestratorInput) {
  const workspaceId = `${userId}-${workspaceKind}`;
  const convId = await getOrCreateConversation(userId, workspaceId, conversationId);
  const history = await loadHistory(convId);

  const tools = TOOL_DEFINITIONS.map(def => ({
    type: 'function' as const,
    function: { name: def.name, description: def.description, parameters: def.parameters as Record<string, unknown> },
  })) as OpenAI.Chat.ChatCompletionTool[];

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  const response = await callOpenAI({ messages, tools });
  const choice = response.choices[0];
  const assistantMessage = choice.message;

  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const call = assistantMessage.tool_calls[0];
    const name = call.function.name;
    const args = JSON.parse(call.function.arguments || '{}');
    let result: any;

    switch (name) {
      case 'get_today_brief':
        result = await buildTodayBrief(userId, args.workspace);
        break;
      case 'create_email_draft':
        result = await createEmailDraft(userId, `${userId}-${args.workspace}`, {
          to: args.to,
          cc: args.cc ?? [],
          bcc: args.bcc ?? [],
          subject: args.subject,
          body: args.body,
        });
        break;
      case 'create_task':
        result = await createTask(userId, `${userId}-${args.workspace}`, {
          title: args.title,
          notes: args.notes,
          dueAt: args.due_at,
          priority: args.priority,
          source: 'assistant',
        });
        break;
      case 'summarize_meeting_text':
        result = await summariseMeetingText(userId, `${userId}-${args.workspace}`, args.meeting_text);
        break;
      case 'request_approval':
        result = await createApproval({
          userId,
          workspaceId: `${userId}-${args.workspace}`,
          actionType: args.action_type,
          payload: args.payload,
        });
        break;
      case 'search_web':
        result = await searchWeb(args.query);
        result = { query: args.query, results: result };
        break;
      case 'list_drive_files':
        result = await listDriveFiles(userId, args.query);
        break;
      case 'create_drive_document':
        result = await createDriveDocument(userId, args.title, args.content);
        break;
      default:
        throw new Error(`Unsupported tool: ${name}`);
    }

    const assistantSummary = `Called ${name}. Result: ${JSON.stringify(result).slice(0, 300)}`;
    await saveMessages(convId, message, assistantSummary);

    return { type: 'tool', name, result, conversationId: convId };
  }

  const content = assistantMessage.content ?? '';
  await saveMessages(convId, message, content);

  return { type: 'assistant', content, conversationId: convId };
}

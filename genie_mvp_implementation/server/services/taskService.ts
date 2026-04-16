import { supabase } from '../integrations/supabase';
import { Task } from '../../types';

/**
 * taskService
 *
 * Manages creation, listing and completion of tasks. For the MVP we
 * interact directly with the Supabase tasks table. When Google
 * Tasks integration is enabled you may sync between services.
 */

export async function createTask(userId: string, workspaceId: string, input: Omit<Task, 'id' | 'workspaceId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      notes: input.notes,
      due_at: input.dueAt,
      priority: input.priority ?? 'normal',
      status: 'open',
      source: input.source ?? 'assistant'
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    workspaceId,
    title: data.title,
    notes: data.notes,
    dueAt: data.due_at,
    priority: data.priority,
    status: data.status,
    source: data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function listTasks(workspaceId: string, status: string = 'open'): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('workspace_id', workspaceId)
    .eq('status', status);
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    notes: row.notes,
    dueAt: row.due_at,
    priority: row.priority,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function completeTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    status: data.status
  };
}
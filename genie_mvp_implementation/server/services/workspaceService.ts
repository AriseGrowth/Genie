import { supabase } from '../integrations/supabase';
import { Workspace, WorkspaceKind } from '../../types';

export async function resolveWorkspace(userId: string, workspaceKind: WorkspaceKind): Promise<Workspace> {
  const id = `${userId}-${workspaceKind}`;
  const name = workspaceKind === 'personal' ? 'Personal' : 'Business';
  const { data, error } = await supabase
    .from('workspaces')
    .upsert({ id, user_id: userId, kind: workspaceKind, name }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, kind: data.kind, name: data.name };
}

export async function assertWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();
  if (error || !data) throw new Error('Workspace access denied');
}

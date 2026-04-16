import { supabase } from '../integrations/supabase';
import { ApprovalActionType, Approval } from '../../types';
import { sendApprovedDraft } from './draftService';
import { createEvent } from '../integrations/googleCalendar';

interface CreateApprovalInput {
  userId: string;
  workspaceId: string;
  actionType: ApprovalActionType;
  payload: any;
}

export async function createApproval(input: CreateApprovalInput): Promise<Approval> {
  const { data, error } = await supabase
    .from('approvals')
    .insert({
      user_id: input.userId,
      workspace_id: input.workspaceId,
      action_type: input.actionType,
      payload: input.payload,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    userId: input.userId,
    workspaceId: input.workspaceId,
    actionType: input.actionType,
    status: 'pending',
    payload: input.payload,
    createdAt: data.created_at,
  };
}

export async function approve(approvalId: string, userId: string): Promise<{ approval: Approval; execution: any }> {
  const { data: approvalRow, error } = await supabase
    .from('approvals')
    .select()
    .eq('id', approvalId)
    .single();
  if (error || !approvalRow) throw new Error('Approval not found');
  if (approvalRow.status !== 'pending') throw new Error('Approval is not pending');

  let execution: any = {};
  switch (approvalRow.action_type as ApprovalActionType) {
    case 'send_email':
      execution = await sendApprovedDraft(approvalId, userId, approvalRow.payload.draftId);
      break;
    case 'create_calendar_event':
      execution = await createEvent(userId, approvalRow.workspace_id, approvalRow.payload);
      break;
    case 'update_calendar_event':
      execution = await createEvent(userId, approvalRow.workspace_id, approvalRow.payload);
      break;
    default:
      throw new Error(`Unsupported approval action: ${approvalRow.action_type}`);
  }

  await supabase
    .from('approvals')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', approvalId);

  return {
    approval: {
      id: approvalId,
      userId: approvalRow.user_id,
      workspaceId: approvalRow.workspace_id,
      actionType: approvalRow.action_type,
      status: 'approved',
      payload: approvalRow.payload,
      createdAt: approvalRow.created_at,
      resolvedAt: new Date().toISOString(),
    },
    execution,
  };
}

export async function reject(approvalId: string, userId: string): Promise<Approval> {
  const { data: approvalRow, error } = await supabase
    .from('approvals')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', approvalId)
    .select()
    .single();
  if (error || !approvalRow) throw new Error('Approval not found');
  return {
    id: approvalRow.id,
    userId: approvalRow.user_id,
    workspaceId: approvalRow.workspace_id,
    actionType: approvalRow.action_type,
    status: 'rejected',
    payload: approvalRow.payload,
    createdAt: approvalRow.created_at,
    resolvedAt: approvalRow.resolved_at,
  };
}

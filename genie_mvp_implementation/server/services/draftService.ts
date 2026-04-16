import { supabase } from '../integrations/supabase';
import { createDraft as gmailCreateDraft, sendDraft as gmailSendDraft, DraftInput } from '../integrations/gmail';
import { EmailDraft } from '../../types';
import { createApproval } from './approvalService';

/**
 * draftService
 *
 * Handles creation, update and sending of email drafts. Drafts are
 * persisted locally (e.g. in Supabase) and optionally synced to
 * Gmail. Sending always requires approval.
 */

export async function createDraft(userId: string, workspaceId: string, input: DraftInput): Promise<EmailDraft> {
  // Create Gmail draft and get external reference
  const gmailRes = await gmailCreateDraft(userId, input);

  // Persist draft locally
  const { data, error } = await supabase
    .from('email_drafts')
    .insert({
      workspace_id: workspaceId,
      to_list: input.to,
      cc_list: input.cc,
      bcc_list: input.bcc,
      subject: input.subject,
      body: input.body,
      status: 'draft',
      external_provider: 'gmail',
      external_ref: gmailRes.gmailDraftId
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    workspaceId,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    body: input.body,
    status: 'draft',
    gmailDraftId: gmailRes.gmailDraftId,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateDraft(userId: string, draftId: string, patch: Partial<Omit<EmailDraft, 'id' | 'workspaceId'>>): Promise<EmailDraft> {
  const { data, error } = await supabase
    .from('email_drafts')
    .update({
      subject: patch.subject,
      body: patch.body,
      status: patch.status
    })
    .eq('id', draftId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    to: data.to_list,
    cc: data.cc_list,
    bcc: data.bcc_list,
    subject: data.subject,
    body: data.body,
    status: data.status,
    gmailDraftId: data.external_ref,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function requestSend(userId: string, workspaceId: string, draftId: string) {
  // Create approval record; the actual execution happens when the user approves
  return createApproval({
    userId,
    workspaceId,
    actionType: 'send_email',
    payload: { draftId }
  });
}

export async function sendApprovedDraft(approvalId: string, userId: string, draftId: string) {
  // Load the draft
  const { data: draft, error } = await supabase
    .from('email_drafts')
    .select()
    .eq('id', draftId)
    .single();
  if (error || !draft) throw new Error('Draft not found');

  // Send via Gmail
  const sendRes = await gmailSendDraft(userId, draft.external_ref);

  // Update status to sent
  await supabase
    .from('email_drafts')
    .update({ status: 'sent' })
    .eq('id', draftId);

  return {
    externalRef: sendRes.externalRef
  };
}
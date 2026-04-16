import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDraft } from '../../../server/services/draftService';
import { supabase } from '../../../server/integrations/supabase';
import { getUserIdFromRequest } from '../../../lib/auth';

const GetQuerySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
});

const PostBodySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  to: z.array(z.string()).min(1),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = GetQuerySchema.safeParse({ workspaceKind: searchParams.get('workspaceKind') });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from('email_drafts')
      .select()
      .eq('workspace_id', `${userId}-${parsed.data.workspaceKind}`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const drafts = (data ?? []).map((row: any) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      to: row.to_list,
      cc: row.cc_list,
      bcc: row.bcc_list,
      subject: row.subject,
      body: row.body,
      status: row.status,
      gmailDraftId: row.gmail_draft_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    return NextResponse.json({ drafts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { workspaceKind, to, cc = [], bcc = [], subject, body: emailBody } = parsed.data;
  try {
    const draft = await createDraft(userId, `${userId}-${workspaceKind}`, {
      to, cc, bcc, subject, body: emailBody,
    });
    return NextResponse.json(draft, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

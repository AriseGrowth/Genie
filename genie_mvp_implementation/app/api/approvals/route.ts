import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '../../../server/integrations/supabase';
import { getUserIdFromRequest } from '../../../lib/auth';

const QuerySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    workspaceKind: searchParams.get('workspaceKind'),
    status: searchParams.get('status') ?? 'pending',
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from('approvals')
      .select()
      .eq('workspace_id', `${userId}-${parsed.data.workspaceKind}`)
      .eq('user_id', userId)
      .eq('status', parsed.data.status ?? 'pending')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const approvals = (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      workspaceId: row.workspace_id,
      actionType: row.action_type,
      status: row.status,
      payload: row.payload,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    }));
    return NextResponse.json({ approvals }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

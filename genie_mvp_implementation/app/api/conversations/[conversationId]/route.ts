import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../../lib/auth';
import { supabase } from '../../../../server/integrations/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { conversationId } = params;

    // Verify the conversation belongs to this user
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, user_id, workspace_id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ messages: messages ?? [], workspaceId: conv.workspace_id });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

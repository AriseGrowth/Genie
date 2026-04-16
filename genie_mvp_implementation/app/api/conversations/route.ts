import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../lib/auth';
import { supabase } from '../../../server/integrations/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    // Fetch conversations with the last message as a preview
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, created_at, workspace_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);

    // Fetch last message for each conversation for the preview
    const withPreviews = await Promise.all(
      (conversations ?? []).map(async (conv: any) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, role, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
        const last = messages?.[0];
        return {
          id: conv.id,
          workspaceId: conv.workspace_id,
          createdAt: conv.created_at,
          preview: last?.content?.slice(0, 80) ?? '',
          lastRole: last?.role ?? 'user',
        };
      })
    );

    return NextResponse.json({ conversations: withPreviews });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

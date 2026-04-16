import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orchestrate } from '../../../server/services/aiOrchestrator';
import { getUserIdFromRequest } from '../../../lib/auth';

const RequestSchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  message: z.string().min(1),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { workspaceKind, message, conversationId } = parsed.data;
  try {
    const result = await orchestrate({ userId, workspaceKind, message, conversationId });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

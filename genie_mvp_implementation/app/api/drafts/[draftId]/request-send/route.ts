import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requestSend } from '../../../../../server/services/draftService';
import { getUserIdFromRequest } from '../../../../../lib/auth';

const BodySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
});

export async function POST(req: NextRequest, { params }: { params: { draftId: string } }) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { draftId } = params;
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const approval = await requestSend(userId, `${userId}-${parsed.data.workspaceKind}`, draftId);
    return NextResponse.json(approval, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

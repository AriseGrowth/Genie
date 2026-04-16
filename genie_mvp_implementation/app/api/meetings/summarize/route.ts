import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { summariseMeetingText } from '../../../../server/services/meetingService';
import { getUserIdFromRequest } from '../../../../lib/auth';

const BodySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  meetingText: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const summary = await summariseMeetingText(userId, `${userId}-${parsed.data.workspaceKind}`, parsed.data.meetingText);
    return NextResponse.json(summary, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

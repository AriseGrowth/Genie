import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApproval } from '../../../../../server/services/approvalService';
import { getUserIdFromRequest } from '../../../../../lib/auth';

const BodySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  title: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  attendees: z.array(z.string()).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
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
  const { workspaceKind, title, startTime, endTime, attendees = [], notes, location } = parsed.data;
  try {
    const approval = await createApproval({
      userId,
      workspaceId: `${userId}-${workspaceKind}`,
      actionType: 'create_calendar_event',
      payload: { title, startTime, endTime, attendees, notes, location },
    });
    return NextResponse.json(approval, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildTodayBrief } from '../../../server/services/todayBriefService';
import { getUserIdFromRequest } from '../../../lib/auth';

const QuerySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
});

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ workspaceKind: searchParams.get('workspaceKind') });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const brief = await buildTodayBrief(userId, parsed.data.workspaceKind);
    return NextResponse.json(brief, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

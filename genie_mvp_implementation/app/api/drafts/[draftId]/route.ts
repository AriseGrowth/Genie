import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateDraft } from '../../../../server/services/draftService';
import { getUserIdFromRequest } from '../../../../lib/auth';

const BodySchema = z.object({
  subject: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'sent', 'rejected', 'failed']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { draftId: string } }) {
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
    const draft = await updateDraft(userId, draftId, {
      subject: parsed.data.subject,
      body: parsed.data.body,
      status: parsed.data.status,
    });
    return NextResponse.json(draft, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserIdFromRequest } from '../../../../lib/auth';

const Schema = z.object({
  name: z.string(),
  type: z.string(),
  base64: z.string(),
  size: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    const body = Schema.parse(await req.json());

    // When Supabase Storage is configured, upload the base64 buffer.
    // Until then, echo back file metadata so the frontend can proceed.
    return NextResponse.json({
      id: `file-${Date.now()}`,
      userId,
      name: body.name,
      type: body.type,
      size: body.size,
      url: null,
    });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

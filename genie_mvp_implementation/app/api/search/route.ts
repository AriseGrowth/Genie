import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserIdFromRequest } from '../../../lib/auth';
import { searchWeb } from '../../../server/integrations/webSearch';

const Schema = z.object({ query: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  try {
    await getUserIdFromRequest(req);
    const body = Schema.parse(await req.json());
    const results = await searchWeb(body.query);
    return NextResponse.json({ results });
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

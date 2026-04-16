import { NextRequest, NextResponse } from 'next/server';
import { approve } from '../../../../../server/services/approvalService';
import { getUserIdFromRequest } from '../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: { params: { approvalId: string } }) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { approvalId } = params;
  try {
    const result = await approve(approvalId, userId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

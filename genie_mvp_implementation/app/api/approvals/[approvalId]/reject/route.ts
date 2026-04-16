import { NextRequest, NextResponse } from 'next/server';
import { reject } from '../../../../../server/services/approvalService';
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
    const approval = await reject(approvalId, userId);
    return NextResponse.json(approval, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

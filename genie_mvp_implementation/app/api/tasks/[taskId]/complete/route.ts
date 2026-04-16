import { NextRequest, NextResponse } from 'next/server';
import { completeTask } from '../../../../../server/services/taskService';
import { getUserIdFromRequest } from '../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { taskId } = params;
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  try {
    const task = await completeTask(taskId);
    return NextResponse.json(task, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

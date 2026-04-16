import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createTask, listTasks } from '../../../server/services/taskService';
import { getUserIdFromRequest } from '../../../lib/auth';

const GetQuerySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  status: z.string().optional(),
});

const PostBodySchema = z.object({
  workspaceKind: z.enum(['personal', 'business']),
  title: z.string().min(1),
  notes: z.string().optional(),
  dueAt: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = GetQuerySchema.safeParse({
    workspaceKind: searchParams.get('workspaceKind'),
    status: searchParams.get('status') ?? 'open',
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const tasks = await listTasks(`${userId}-${parsed.data.workspaceKind}`, parsed.data.status ?? 'open');
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdFromRequest(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { workspaceKind, title, notes, dueAt, priority } = parsed.data;
  try {
    const task = await createTask(userId, `${userId}-${workspaceKind}`, {
      title, notes, dueAt, priority: priority ?? 'normal', source: 'manual',
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

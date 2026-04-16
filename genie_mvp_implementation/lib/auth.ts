import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserIdFromRequest(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) throw new Error('Unauthorized');
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error('Unauthorized');
  return data.user.id;
}

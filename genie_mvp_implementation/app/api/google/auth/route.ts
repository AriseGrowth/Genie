import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../../../lib/auth';

const SCOPES: Record<string, string[]> = {
  drive: ['https://www.googleapis.com/auth/drive.readonly'],
  calendar: ['https://www.googleapis.com/auth/calendar'],
  gmail: ['https://mail.google.com/'],
  tasks: ['https://www.googleapis.com/auth/tasks'],
};

export async function GET(req: NextRequest) {
  try {
    await getUserIdFromRequest(req);
    const service = req.nextUrl.searchParams.get('service') ?? 'drive';
    const scopes = SCOPES[service] ?? SCOPES.drive;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env.local.' }, { status: 501 });
    }

    const redirectUri = `${req.nextUrl.origin}/api/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: service,
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

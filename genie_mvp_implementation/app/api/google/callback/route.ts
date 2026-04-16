import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../server/integrations/supabase';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const service = req.nextUrl.searchParams.get('state') ?? 'drive';

  if (!code) {
    return NextResponse.redirect(`${req.nextUrl.origin}/settings?error=oauth_cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${req.nextUrl.origin}/settings?error=not_configured`);
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      throw new Error(tokens.error_description ?? 'Token exchange failed');
    }

    // Get account email
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    // The user_id must come from the session — in this callback we use the sub from profile
    // In production store against the authenticated Supabase user
    await supabase.from('user_integrations').upsert({
      user_id: profile.id,
      provider: `google_${service}`,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      account_email: profile.email,
    }, { onConflict: 'user_id,provider' });

    return NextResponse.redirect(`${req.nextUrl.origin}/settings?connected=${service}`);
  } catch (err: any) {
    return NextResponse.redirect(`${req.nextUrl.origin}/settings?error=${encodeURIComponent(err.message)}`);
  }
}

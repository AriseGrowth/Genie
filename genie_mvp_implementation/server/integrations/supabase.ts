import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client wrapper.
 *
 * Reads configuration from environment variables and exports a
 * configured client. Use this client in your services to perform
 * database queries. Never leak the service role key to the client
 * side; it must remain on the server.
 */

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Service role key has elevated privileges; ensure it is only used on the server.
export const supabase = createClient(supabaseUrl, serviceRoleKey);
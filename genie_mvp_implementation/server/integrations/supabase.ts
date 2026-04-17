import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key';

export const supabase = createClient(supabaseUrl, serviceRoleKey);

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️  Supabase env vars not set — some features may not work correctly');
}

const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;

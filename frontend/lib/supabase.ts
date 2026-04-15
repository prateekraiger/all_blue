import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate configuration
const isValidConfig = 
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key';

if (!isValidConfig) {
  console.warn(
    '⚠️ Supabase configuration is missing or invalid. \n' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file. \n' +
    'The app will continue to run, but Supabase features will be disabled.'
  );
}

// Initialize client only if config is valid
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null as any;

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

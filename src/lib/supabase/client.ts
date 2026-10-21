import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Checks whether valid Supabase public environment variables are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes('your-project.supabase.co') || anonKey.includes('your-anon-key')) {
    return false;
  }
  return true;
}

/**
 * Returns a singleton public Supabase client for client-side and public verifier queries.
 * Returns null if environment variables are unconfigured, allowing graceful mock fallback.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    browserClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return browserClient;
}

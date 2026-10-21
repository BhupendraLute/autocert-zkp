import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Checks whether Supabase admin/service-role credentials are configured.
 */
export function isSupabaseAdminConfigured(): boolean {
  if (typeof window !== 'undefined') {
    return false; // Never allow admin check on client side
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return false;
  if (url.includes('your-project.supabase.co') || serviceKey.includes('your-service-role-key')) {
    return false;
  }
  return true;
}

/**
 * Server-only privileged Supabase client for administrative operations (anchoring roots, revocations).
 * Throws if called in client-side code. Returns null if unconfigured.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: getSupabaseAdminClient must NEVER be called in browser context.');
  }

  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    adminClient = createClient<Database>(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

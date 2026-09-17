/**
 * Supabase Admin Client (Service Role)
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SECURITY WARNING                                               │
 * │                                                                 │
 * │  This client uses the SERVICE ROLE KEY which BYPASSES ALL      │
 * │  Row Level Security policies.                                   │
 * │                                                                 │
 * │  It must NEVER be used in:                                      │
 * │    - Client Components                                          │
 * │    - Browser-accessible code                                    │
 * │    - Any file without 'use server' or server-only guard         │
 * │                                                                 │
 * │  The `import 'server-only'` directive below causes a           │
 * │  BUILD ERROR if this file is ever imported in a Client         │
 * │  Component or a non-server context.                             │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Permitted uses in SmartCare:
 *   1. Writing to audit_logs (append-only, bypasses anon-key RLS)
 *   2. Admin role promotion: UPDATE profiles SET role = 'doctor'
 *   3. Admin doctor creation: INSERT INTO doctor_profiles
 *   4. Any operation that legitimately requires bypassing RLS
 *      (must be documented and audited)
 *
 * SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.
 * It must NEVER have a NEXT_PUBLIC_ prefix.
 *
 * Supported env var names (checked in order):
 *   SUPABASE_SERVICE_ROLE_KEY  (canonical)
 *   SUPABASE_SERVICE_KEY       (common alias)
 *   SUPABASE_SECRET_KEY        (legacy alias)
 */
import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Resolves the service-role key or falls back to anon key. */
function resolveServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY
  );
}

/** Returns true if a real service-role key is available in the environment. */
export function hasServiceRoleKey(): boolean {
  return Boolean(resolveServiceRoleKey());
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey =
    resolveServiceRoleKey() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const createAdminClient = createSupabaseAdminClient;


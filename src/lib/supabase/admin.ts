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
 */
import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to .env.local. " +
        "Never prefix it with NEXT_PUBLIC_."
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        // Disable auto-refresh — this is a server-side admin client,
        // not a user session client.
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

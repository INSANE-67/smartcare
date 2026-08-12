/**
 * Supabase Server Client
 *
 * Use this client in:
 *   - Server Components
 *   - Server Actions ('use server')
 *   - Route Handlers (app/api/**)
 *
 * This client reads and writes the auth session via httpOnly cookies
 * using Next.js's cookies() API from next/headers.
 *
 * The `server-only` import causes a build-time error if this file
 * is accidentally imported in a Client Component.
 *
 * Do NOT use this in proxy.ts — use the proxy client instead.
 */
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component (read-only context).
            // This is safe to ignore — the proxy client handles token refresh
            // so the session stays valid even when cookies can't be set here.
          }
        },
      },
    }
  );
}

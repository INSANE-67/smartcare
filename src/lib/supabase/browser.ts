/**
 * Supabase Browser Client
 *
 * Use this client in Client Components ('use client').
 * Uses NEXT_PUBLIC_ env vars — safe to expose to the browser.
 * Session is managed via browser cookies handled by @supabase/ssr.
 *
 * Do NOT import this file in Server Components, Server Actions,
 * Route Handlers, or proxy.ts. Use the server client instead.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

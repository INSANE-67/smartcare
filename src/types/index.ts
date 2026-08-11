/**
 * Shared TypeScript types and interfaces for SmartCare.
 *
 * This file exports application-wide types.
 * Database-generated types (from Supabase) will be in a separate
 * `src/types/database.ts` file (auto-generated, not hand-written).
 *
 * Naming conventions:
 *   - Use `type` for union/intersection types and simple shapes
 *   - Use `interface` for object shapes that may be extended
 *   - Prefix database row types with the table name (e.g., `PatientRow`)
 *   - Prefix component prop types with the component name (e.g., `ButtonProps`)
 */

// ─────────────────────────────────────────────────────────────────────────────
// User Roles
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

// ─────────────────────────────────────────────────────────────────────────────
// Generic API response wrapper
// ─────────────────────────────────────────────────────────────────────────────

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Shared utility helpers for SmartCare.
 *
 * Add pure, side-effect-free utility functions here.
 * Do not import Supabase, AI SDK, or other heavy dependencies here.
 */

/**
 * Combines CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx for simple use cases.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

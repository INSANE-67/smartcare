-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Allow Users to Insert/Upsert Own Profile
-- Migration: 020_profiles_insert_own_policy.sql
--
-- Description:
--   Adds an RLS policy on public.profiles allowing authenticated users
--   to insert their own profile record if missing (e.g. self-healing
--   during sign-in or registration).
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Fix Profiles RLS Policy
-- Migration: 015_profiles_rls_policy.sql
-- Description: Ensures authenticated users can always read their own profile row and role.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Explicitly drop any existing conflicting user read policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 2. Create the unified "Users can read own profile" policy
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 3. Also ensure users can read their own doctor record if they are doctors
DROP POLICY IF EXISTS "Doctors can read own record" ON public.doctors;
CREATE POLICY "Doctors can read own record"
  ON public.doctors FOR SELECT
  USING (auth.uid() = profile_id);

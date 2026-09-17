-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Allow Authenticated Patients to Read Doctors and Doctor Profiles
-- Migration: 021_doctors_profiles_select_rls.sql
-- Description:
--   Ensures authenticated users (specifically patients browsing the directory)
--   can read doctor records from public.doctors and doctor profiles from
--   public.profiles without being restricted to only existing appointments.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure RLS is enabled
ALTER TABLE public.doctors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Doctors table: allow all authenticated users to read doctor records in directory
DROP POLICY IF EXISTS "Authenticated users can read doctors" ON public.doctors;
CREATE POLICY "Authenticated users can read doctors"
  ON public.doctors
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Profiles table: allow all authenticated users to read profiles of users with doctor role
DROP POLICY IF EXISTS "Authenticated users can read doctor profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read doctor profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND role = 'doctor'
  );

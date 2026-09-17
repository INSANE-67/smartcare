-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Clean Non-Recursive RLS Policies for Profiles, Doctors, Appointments
-- Migration: 022_clean_non_recursive_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Drop all existing policies on the three tables to kill any recursion loop
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('profiles', 'doctors', 'appointments') AND schemaname = 'public'
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP; 
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Clean, Non-Recursive Policies for PROFILES
-- Anyone authenticated or anon can view profiles; users can only update/insert their own
CREATE POLICY "profiles_select_policy" 
ON public.profiles FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "profiles_update_policy" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. Clean, Non-Recursive Policies for DOCTORS
-- Anyone authenticated or anon can view doctors; doctors can only modify their own record
CREATE POLICY "doctors_select_policy" 
ON public.doctors FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "doctors_modify_policy" 
ON public.doctors FOR ALL 
TO authenticated 
USING (profile_id = auth.uid());

-- 4. Clean, Non-Recursive Policies for APPOINTMENTS
-- Patients can view/manage their appointments directly without querying other tables
CREATE POLICY "appointments_patient_policy" 
ON public.appointments FOR ALL 
TO authenticated 
USING (patient_id = auth.uid());

-- Doctors can view appointments assigned to them (direct check by profile id or doctor table id)
CREATE POLICY "appointments_doctor_policy" 
ON public.appointments FOR ALL 
TO authenticated 
USING (
  doctor_id = auth.uid()
  OR doctor_id IN (
    SELECT id FROM public.doctors WHERE profile_id = auth.uid()
  )
);

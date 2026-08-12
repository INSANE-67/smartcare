-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Row Level Security Policies
-- Migration: 003_rls_policies.sql
-- Depends on: 001_foundation_schema.sql (tables)
--             002_triggers_functions.sql (get_user_role, has_active_relationship)
--
-- Security model:
--   Patient  → own data only
--   Doctor   → own data + ACTIVE-relationship patients ONLY
--              pending / inactive / revoked = no data access (same as stranger)
--   Admin    → explicit and minimal (user management; NOT patient medical data)
--   Default  → DENY ALL (no permissive policy = no access)
--
-- Idempotent: every policy uses DROP ... IF EXISTS before CREATE.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable RLS ───────────────────────────────────────────────────────────
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY is safe to repeat (no-op).

ALTER TABLE public.profiles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_relationships ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT: own row (any role)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- SELECT: admin sees all profiles
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

-- SELECT: verified doctor sees profiles of ACTIVE patients only.
-- Grants basic profile fields (name, phone, dob, gender, avatar).
-- Detailed medical data (allergies, blood type) lives in patient_profiles
-- which is deferred to Phase 3.
DROP POLICY IF EXISTS "profiles_select_doctor_active_patient" ON public.profiles;
CREATE POLICY "profiles_select_doctor_active_patient"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role() = 'doctor'
    AND public.has_active_relationship(auth.uid(), profiles.id)
  );

-- SELECT: any authenticated user may view profiles of verified doctors.
-- Purpose: doctor directory (name, avatar). Specialty/bio come from doctors table.
DROP POLICY IF EXISTS "profiles_select_verified_doctor_directory" ON public.profiles;
CREATE POLICY "profiles_select_verified_doctor_directory"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND profiles.role = 'doctor'
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.profile_id = profiles.id
        AND d.is_verified = true
    )
  );

-- UPDATE: user updates own row.
-- WITH CHECK prevents self-modification of role or is_active.
-- Role and is_active are admin-only writes.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role      = (SELECT role      FROM public.profiles WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
  );

-- UPDATE: admin can update any profile row (role changes, is_active toggle).
-- Role changes require the service-role client in the application layer —
-- the anon key still respects this RLS policy during admin actions.
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- INSERT: not permitted via RLS.
--   handle_new_auth_user trigger creates profiles rows automatically.
-- DELETE: not permitted via RLS.
--   Use is_active = false (soft-delete).

-- ═══════════════════════════════════════════════════════════════════════════
-- DOCTORS
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT: doctor sees their own record (all fields including is_verified)
DROP POLICY IF EXISTS "doctors_select_own" ON public.doctors;
CREATE POLICY "doctors_select_own"
  ON public.doctors FOR SELECT
  USING (profile_id = auth.uid());

-- SELECT: admin sees all doctor records
DROP POLICY IF EXISTS "doctors_select_admin" ON public.doctors;
CREATE POLICY "doctors_select_admin"
  ON public.doctors FOR SELECT
  USING (public.get_user_role() = 'admin');

-- SELECT: any authenticated user may view verified doctors (directory).
DROP POLICY IF EXISTS "doctors_select_verified_directory" ON public.doctors;
CREATE POLICY "doctors_select_verified_directory"
  ON public.doctors FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_verified = true
  );

-- SELECT: patient sees full doctor record when a pending or active relationship
-- exists. Allows the patient to review details of a doctor who sent a request.
DROP POLICY IF EXISTS "doctors_select_patient_with_relationship" ON public.doctors;
CREATE POLICY "doctors_select_patient_with_relationship"
  ON public.doctors FOR SELECT
  USING (
    public.get_user_role() = 'patient'
    AND EXISTS (
      SELECT 1 FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id  = doctors.profile_id
        AND dpr.patient_id = auth.uid()
        AND dpr.status IN ('pending', 'active')
    )
  );

-- UPDATE: doctor updates own non-verification fields (specialty, bio, etc.).
-- WITH CHECK locks is_verified, verified_by, and verified_at against
-- self-modification — those are admin-only writes.
DROP POLICY IF EXISTS "doctors_update_own" ON public.doctors;
CREATE POLICY "doctors_update_own"
  ON public.doctors FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (
    profile_id = auth.uid()
    AND is_verified = (
      SELECT is_verified FROM public.doctors WHERE profile_id = auth.uid()
    )
    AND verified_by IS NOT DISTINCT FROM (
      SELECT verified_by FROM public.doctors WHERE profile_id = auth.uid()
    )
    AND verified_at IS NOT DISTINCT FROM (
      SELECT verified_at FROM public.doctors WHERE profile_id = auth.uid()
    )
  );

-- UPDATE: admin can update any field on any doctor record.
DROP POLICY IF EXISTS "doctors_update_admin" ON public.doctors;
CREATE POLICY "doctors_update_admin"
  ON public.doctors FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- INSERT: no permissive policy for the anon key.
--   INSERT only possible via service-role client (admin promotion Server Action).
-- DELETE: not permitted via RLS.

-- ═══════════════════════════════════════════════════════════════════════════
-- DOCTOR_PATIENT_RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT: doctor sees all their own relationships (any status)
DROP POLICY IF EXISTS "dpr_select_doctor" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_select_doctor"
  ON public.doctor_patient_relationships FOR SELECT
  USING (doctor_id = auth.uid());

-- SELECT: patient sees all their own relationships (any status)
DROP POLICY IF EXISTS "dpr_select_patient" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_select_patient"
  ON public.doctor_patient_relationships FOR SELECT
  USING (patient_id = auth.uid());

-- SELECT: admin sees all relationships
DROP POLICY IF EXISTS "dpr_select_admin" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_select_admin"
  ON public.doctor_patient_relationships FOR SELECT
  USING (public.get_user_role() = 'admin');

-- INSERT: verified doctor initiates a request to a patient.
-- WITH CHECK enforces:
--   - doctor_id must equal auth.uid() (cannot insert on behalf of another doctor)
--   - initiator_role must be 'doctor'
--   - initiated_by must equal auth.uid()
--   - status must be 'pending' (cannot self-activate)
--   - doctor must be verified (prevents unverified doctors from requesting)
DROP POLICY IF EXISTS "dpr_insert_doctor" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_insert_doctor"
  ON public.doctor_patient_relationships FOR INSERT
  WITH CHECK (
    doctor_id      = auth.uid()
    AND public.get_user_role() = 'doctor'
    AND initiated_by   = auth.uid()
    AND initiator_role = 'doctor'
    AND status         = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.profile_id = auth.uid()
        AND d.is_verified = true
    )
  );

-- INSERT: patient initiates a request to a verified doctor.
-- WITH CHECK enforces:
--   - patient_id must equal auth.uid()
--   - status must be 'pending'
--   - target doctor must be verified
DROP POLICY IF EXISTS "dpr_insert_patient" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_insert_patient"
  ON public.doctor_patient_relationships FOR INSERT
  WITH CHECK (
    patient_id     = auth.uid()
    AND public.get_user_role() = 'patient'
    AND initiated_by   = auth.uid()
    AND initiator_role = 'patient'
    AND status         = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.profile_id = doctor_patient_relationships.doctor_id
        AND d.is_verified = true
    )
  );

-- UPDATE: patient manages relationships where they are the patient side.
-- Can transition: pending→active, active→inactive, inactive→active, any→revoked.
-- WITH CHECK: patient_id must remain unchanged.
DROP POLICY IF EXISTS "dpr_update_patient" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_update_patient"
  ON public.doctor_patient_relationships FOR UPDATE
  USING  (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- UPDATE: doctor can cancel their own outgoing pending request only.
-- USING:      must be the doctor, must be pending, must have been their initiation.
-- WITH CHECK: can only transition to 'revoked' (cancel = revoke).
--             Doctor cannot accept their own request or set it to 'active'.
DROP POLICY IF EXISTS "dpr_update_doctor_cancel" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_update_doctor_cancel"
  ON public.doctor_patient_relationships FOR UPDATE
  USING (
    doctor_id      = auth.uid()
    AND status         = 'pending'
    AND initiator_role = 'doctor'
  )
  WITH CHECK (
    doctor_id = auth.uid()
    AND status = 'revoked'
  );

-- UPDATE: admin can update any relationship (administrative intervention).
DROP POLICY IF EXISTS "dpr_update_admin" ON public.doctor_patient_relationships;
CREATE POLICY "dpr_update_admin"
  ON public.doctor_patient_relationships FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- DELETE: not permitted via RLS.
--   Relationships are never deleted — status = 'revoked' is the terminal state.

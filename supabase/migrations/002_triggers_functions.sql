-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Triggers and Helper Functions
-- Migration: 002_triggers_functions.sql
-- Creates: helper functions, trigger functions, and attaches all triggers.
-- Depends on: 001_foundation_schema.sql (tables must exist for trigger attach)
-- Idempotent: CREATE OR REPLACE FUNCTION, CREATE OR REPLACE TRIGGER (PG 14+)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Helper: get_user_role() ──────────────────────────────────────────────
-- Returns the role of the currently authenticated user from public.profiles.
--
-- Why this exists: avoids repeating the same subquery in every RLS policy
-- that needs to check if the caller is an admin or doctor.
--
-- SECURITY DEFINER: reads profiles bypassing its own RLS policies during
--   policy evaluation. Safe because it queries by auth.uid() PK only.
-- STABLE: PostgreSQL may cache the result once per SQL statement (not per row),
--   avoiding repeated lookups in policies that reference multiple rows.
-- SET search_path = public: prevents search_path injection attacks.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ─── Helper: has_active_relationship() ───────────────────────────────────
-- Returns TRUE if an ACTIVE relationship exists between the given doctor
-- and patient.
--
-- Why this exists: centralises the access-control check. If the rule
-- ever changes (e.g. to also allow 'inactive'), this is the single
-- place to update — all policies using this function benefit automatically.
--
-- SECURITY DEFINER: can query doctor_patient_relationships during profiles
--   or doctors RLS evaluation without circular dependency.
-- STABLE: cacheable per statement.

CREATE OR REPLACE FUNCTION public.has_active_relationship(
  p_doctor_id  UUID,
  p_patient_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.doctor_patient_relationships
    WHERE doctor_id  = p_doctor_id
      AND patient_id = p_patient_id
      AND status     = 'active'
  )
$$;

-- ─── Trigger function: set_updated_at() ──────────────────────────────────
-- Sets updated_at = now() on every UPDATE.
-- Applied as BEFORE UPDATE to all 3 tables via separate triggers below.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── Trigger function: set_relationship_timestamps() ─────────────────────
-- Automatically records established_at and revoked_at on status transitions.
-- Ensures accuracy regardless of which code path performs the UPDATE.
-- Applied as BEFORE UPDATE to doctor_patient_relationships only.

CREATE OR REPLACE FUNCTION public.set_relationship_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Record the moment this relationship became active
  IF NEW.status = 'active' AND OLD.status <> 'active' THEN
    NEW.established_at = now();
  END IF;

  -- Record the moment this relationship was revoked (terminal state)
  IF NEW.status = 'revoked' AND OLD.status <> 'revoked' THEN
    NEW.revoked_at = now();
  END IF;

  RETURN NEW;
END;
$$;

-- ─── Trigger function: handle_new_auth_user() ────────────────────────────
-- Creates a public.profiles row automatically when a user completes
-- registration via Supabase Auth (INSERT on auth.users fires this trigger).
--
-- ALL self-registrations produce role = 'patient'.
-- Promotion to 'doctor' or 'admin' requires an explicit admin Server Action.
--
-- SECURITY DEFINER: required to INSERT into public.profiles from the
--   auth schema execution context.
-- SET search_path = public: prevents search_path injection.
-- ON CONFLICT DO NOTHING: makes the function idempotent if triggered twice.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      'New User'
    ),
    'patient'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ─── Attach updated_at triggers to all 3 tables ───────────────────────────
-- CREATE OR REPLACE TRIGGER requires PostgreSQL 14+.
-- Supabase runs PostgreSQL 15, so this is safe.

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_dpr_updated_at
  BEFORE UPDATE ON public.doctor_patient_relationships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Attach relationship timestamp trigger ────────────────────────────────

CREATE OR REPLACE TRIGGER trg_dpr_timestamps
  BEFORE UPDATE ON public.doctor_patient_relationships
  FOR EACH ROW EXECUTE FUNCTION public.set_relationship_timestamps();

-- ─── Auth trigger — handle_new_auth_user on auth.users ───────────────────
-- ⚠ STOP POINT: If Supabase returns an error on the statement below,
--   stop immediately and report the exact error text. Do not attempt
--   any fallback silently.

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

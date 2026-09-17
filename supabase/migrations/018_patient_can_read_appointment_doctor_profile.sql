-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Fix Patient Profile Visibility for Booked Doctors
-- Migration: 018_patient_can_read_appointment_doctor_profile.sql
--
-- Problem:
--   When a patient views their appointments or "My Doctors" page, the app
--   queries profiles to resolve doctor names. However, the existing RLS on
--   profiles only allows reading doctor profiles when:
--     (a) the doctor is verified (profiles_select_verified_doctor_directory), or
--     (b) an active doctor_patient_relationship exists.
--
--   If a doctor is not yet verified, or no explicit relationship row exists,
--   the patient cannot read the doctor's profile — causing names to fall back
--   to "Doctor" instead of the real name.
--
-- Fix:
--   Add a SELECT policy on profiles that allows a patient (auth.uid()) to
--   read any profile row where that profile is the doctor_id on one of the
--   patient's own appointments. This is strictly scoped to the patient's own
--   appointment data and does not expose other profiles.
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Patients can read profiles of their appointment doctors" ON public.profiles;

CREATE POLICY "Patients can read profiles of their appointment doctors"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.patient_id = auth.uid()
        AND a.doctor_id  = profiles.id
    )
  );

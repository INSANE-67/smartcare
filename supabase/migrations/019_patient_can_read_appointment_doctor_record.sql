-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Fix Patient Doctor Record Visibility for Booked Doctors
-- Migration: 019_patient_can_read_appointment_doctor_record.sql
--
-- Problem:
--   When a patient views appointments or "My Doctors", the app queries the
--   doctors table to resolve specialty and department info. The existing RLS
--   on doctors allows patients to see doctor records only when:
--     (a) the doctor is verified (doctors_select_verified_directory), or
--     (b) an active/pending doctor_patient_relationship exists.
--
--   If neither condition is met, specialty/department falls back to
--   "General Practice".
--
-- Fix:
--   Add a SELECT policy on doctors that allows a patient (auth.uid()) to read
--   any doctor row where that doctor's profile_id is the doctor_id on one of
--   the patient's own appointments. Strictly scoped to the patient's own data.
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Patients can read doctor records for their appointments" ON public.doctors;

CREATE POLICY "Patients can read doctor records for their appointments"
  ON public.doctors
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.patient_id = auth.uid()
        AND a.doctor_id  = doctors.profile_id
    )
  );

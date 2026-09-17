-- Migration: 017_fix_appointments_insert_policy.sql
-- 
-- Problem: The original INSERT policy on public.appointments requires an existing
-- active doctor_patient_relationship row. However, the patient INSERT policy on
-- doctor_patient_relationships only allows status = 'pending' (not 'active'), so
-- the server action trying to pre-create an 'active' relationship fails silently,
-- leaving no relationship row → appointments INSERT policy rejects the insert.
--
-- Fix: Replace the relationship-based check with a simpler verified-doctor check.
-- A patient can book an appointment with any verified doctor.
-- The doctor_patient_relationship is created separately (status=pending) and can
-- be approved by the patient or admin independently.

DROP POLICY IF EXISTS "Patients can create appointments with their active doctors" ON public.appointments;

CREATE POLICY "Patients can create appointments with verified doctors"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    -- The inserting user must be the patient
    auth.uid() = patient_id
    -- The target doctor must be verified
    AND EXISTS (
      SELECT 1
      FROM public.doctors d
      WHERE d.profile_id = appointments.doctor_id
        AND d.is_verified = true
    )
  );

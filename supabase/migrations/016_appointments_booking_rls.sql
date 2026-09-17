-- Migration: 016_appointments_booking_rls.sql
-- Fix appointment booking RLS policy to allow patients to book with any verified doctor

DROP POLICY IF EXISTS "Patients can create appointments with their active doctors" ON public.appointments;

CREATE POLICY "Patients can create appointments with their active doctors"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND (
      EXISTS (
        SELECT 1
        FROM public.doctors d
        WHERE (d.profile_id = appointments.doctor_id OR d.id = appointments.doctor_id)
          AND d.is_verified = true
      )
      OR EXISTS (
        SELECT 1
        FROM public.doctor_patient_relationships dpr
        WHERE dpr.patient_id = auth.uid()
          AND dpr.doctor_id = appointments.doctor_id
      )
    )
  );

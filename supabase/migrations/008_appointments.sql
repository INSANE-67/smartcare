-- Migration: 008_appointments.sql
-- Adds appointments table and RLS policies for appointment scheduling.

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status appointment_status DEFAULT 'pending'::appointment_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Make migration idempotent
DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view appointments assigned to them" ON public.appointments;
DROP POLICY IF EXISTS "Patients can create appointments with their active doctors" ON public.appointments;
DROP POLICY IF EXISTS "Patients can cancel their own pending appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can update their assigned appointments" ON public.appointments;

-- 1. Patients can SELECT their own appointments
CREATE POLICY "Patients can view their own appointments"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 2. Doctors can SELECT their assigned appointments
CREATE POLICY "Doctors can view appointments assigned to them"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- 3. Patients can INSERT appointments if they have an active relationship
CREATE POLICY "Patients can create appointments with their active doctors"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1
      FROM public.doctor_patient_relationships dpr
      WHERE dpr.patient_id = auth.uid()
        AND dpr.doctor_id = appointments.doctor_id
        AND dpr.status = 'active'
    )
  );

-- 4. Patients can UPDATE (cancel) their own pending appointments
CREATE POLICY "Patients can cancel their own pending appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.uid() = patient_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = patient_id
    AND status = 'cancelled'
  );

-- 5. Doctors can UPDATE (confirm, complete, reject, notes) their assigned appointments
CREATE POLICY "Doctors can update their assigned appointments"
  ON public.appointments
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);


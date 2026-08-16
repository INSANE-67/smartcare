-- Migration: 010_consultation_notes.sql
-- Adds consultation_notes table and RLS policies.

CREATE TABLE IF NOT EXISTS public.consultation_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  observations TEXT NOT NULL,
  treatment_plan TEXT NOT NULL,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(appointment_id)
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_consultation_notes_patient_id ON public.consultation_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_doctor_id ON public.consultation_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_appointment_id ON public.consultation_notes(appointment_id);

-- Enable RLS
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger (Idempotent)
DROP TRIGGER IF EXISTS update_consultation_notes_updated_at ON public.consultation_notes;

CREATE TRIGGER update_consultation_notes_updated_at
  BEFORE UPDATE ON public.consultation_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Make migration idempotent by dropping policies if they exist
DROP POLICY IF EXISTS "Patients can view their own consultation notes" ON public.consultation_notes;
DROP POLICY IF EXISTS "Doctors can create consultation notes for their appointments" ON public.consultation_notes;
DROP POLICY IF EXISTS "Doctors can view consultation notes they created" ON public.consultation_notes;
DROP POLICY IF EXISTS "Doctors can edit consultation notes they created" ON public.consultation_notes;

-- 1. Patients can SELECT their own consultation notes
CREATE POLICY "Patients can view their own consultation notes"
  ON public.consultation_notes
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 2. Doctors can SELECT consultation notes they created
CREATE POLICY "Doctors can view consultation notes they created"
  ON public.consultation_notes
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- 3. Doctors can INSERT consultation notes for appointments assigned to them
CREATE POLICY "Doctors can create consultation notes for their appointments"
  ON public.consultation_notes
  FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = consultation_notes.appointment_id
        AND a.doctor_id = auth.uid()
        AND a.patient_id = consultation_notes.patient_id
        AND a.status = 'completed'
    )
  );

-- 4. Doctors can UPDATE consultation notes they created
CREATE POLICY "Doctors can edit consultation notes they created"
  ON public.consultation_notes
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- Delete operations are restricted (no policy for DELETE means deny by default)

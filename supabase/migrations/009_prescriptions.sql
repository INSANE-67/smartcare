-- Migration: 009_prescriptions.sql
-- Adds prescriptions table and RLS policies for prescription management.

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'prescription_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.prescription_status AS ENUM (
      'active',
      'completed',
      'discontinued'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status prescription_status DEFAULT 'active'::prescription_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Make migration idempotent by dropping policies if they exist
DROP POLICY IF EXISTS "Patients can view their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can view prescriptions for their active patients or ones they issued" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions for active patients" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can edit prescriptions they issued" ON public.prescriptions;

-- 1. Patients can SELECT their own prescriptions
CREATE POLICY "Patients can view their own prescriptions"
  ON public.prescriptions
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 2. Doctors can SELECT prescriptions for their patients OR prescriptions they issued
CREATE POLICY "Doctors can view prescriptions for their active patients or ones they issued"
  ON public.prescriptions
  FOR SELECT
  USING (
    auth.uid() = doctor_id
    OR EXISTS (
      SELECT 1
      FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = prescriptions.patient_id
        AND dpr.status = 'active'
    )
  );

-- 3. Doctors can INSERT prescriptions for active patients
CREATE POLICY "Doctors can create prescriptions for active patients"
  ON public.prescriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id
    AND EXISTS (
      SELECT 1
      FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = prescriptions.patient_id
        AND dpr.status = 'active'
    )
  );

-- 4. Doctors can UPDATE prescriptions they created
CREATE POLICY "Doctors can edit prescriptions they issued"
  ON public.prescriptions
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- Delete operations are restricted (no policy for DELETE means deny by default)

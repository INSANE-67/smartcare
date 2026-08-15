-- Migration: 006_medical_records_foundation.sql
-- Creates the medical_records table and enforces relationship-based RLS access.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'record_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.record_type AS ENUM (
      'clinical_note', 'lab_result', 'prescription', 'imaging', 'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.medical_records (
  id             UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID                 NOT NULL
                                        REFERENCES public.profiles(id)
                                        ON DELETE CASCADE,
  doctor_id      UUID                 -- Nullable, if added by patient or system
                                        REFERENCES public.profiles(id)
                                        ON DELETE SET NULL,
  title          TEXT                 NOT NULL,
  description    TEXT,
  type           public.record_type   NOT NULL DEFAULT 'other',
  attachment_url TEXT,                -- Deferred implementation for Supabase Storage
  record_date    DATE                 NOT NULL DEFAULT current_date,
  created_at     TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id
  ON public.medical_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id
  ON public.medical_records(doctor_id);

CREATE INDEX IF NOT EXISTS idx_medical_records_type
  ON public.medical_records(type);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER trg_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ────────────────────────────────────────────────────────────

-- 1. Patients can SELECT their own medical records
CREATE POLICY "Patients can view own medical records"
  ON public.medical_records
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 2. Patients can INSERT their own medical records
CREATE POLICY "Patients can insert own medical records"
  ON public.medical_records
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- 3. Doctors can SELECT medical records if there is an active relationship
CREATE POLICY "Doctors can view patient records with active relationship"
  ON public.medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_patient_relationships dpr
      WHERE dpr.doctor_id = auth.uid()
        AND dpr.patient_id = medical_records.patient_id
        AND dpr.status = 'active'
    )
  );

-- No UPDATE or DELETE policies yet (as per specification)

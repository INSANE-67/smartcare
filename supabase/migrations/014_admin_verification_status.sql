-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Admin Verification Status
-- Migration: 014_admin_verification_status.sql
-- Description: Introduces the doctor_verification_status ENUM and updates the 
-- doctors table to track approval and rejection states.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create the new ENUM for verification status
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'doctor_verification_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.doctor_verification_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- 2. Alter doctors table to add new admin verification columns
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS verification_status public.doctor_verification_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Backfill existing records: update 'pending' to 'approved' for already verified doctors
UPDATE public.doctors
SET verification_status = 'approved'
WHERE is_verified = true 
  AND verification_status = 'pending';

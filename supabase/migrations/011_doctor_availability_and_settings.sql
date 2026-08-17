-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Phase 3/4 Doctor Availability and Settings
-- Migration: 011_doctor_availability_and_settings.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Alter tables with idempotency ──────────────────────────────────────────

ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS is_accepting_appointments BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS appointment_duration INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS clinic_address TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "in_app": true}'::jsonb;

-- ─── Table: doctor_availability ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week         INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  break_start_time    TIME,
  break_end_time      TIME,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_doctor_day UNIQUE (doctor_id, day_of_week),
  CONSTRAINT chk_times CHECK (end_time > start_time),
  CONSTRAINT chk_break_times CHECK (
    (break_start_time IS NULL AND break_end_time IS NULL) OR
    (break_start_time IS NOT NULL AND break_end_time IS NOT NULL AND break_end_time > break_start_time AND break_start_time >= start_time AND break_end_time <= end_time)
  )
);

-- ─── Triggers ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_updated_at ON public.doctor_availability;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS Policies ───────────────────────────────────────────────────────────

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view doctor availability" ON public.doctor_availability;
CREATE POLICY "Anyone can view doctor availability"
  ON public.doctor_availability
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Doctors can insert their own availability" ON public.doctor_availability;
CREATE POLICY "Doctors can insert their own availability"
  ON public.doctor_availability
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can update their own availability" ON public.doctor_availability;
CREATE POLICY "Doctors can update their own availability"
  ON public.doctor_availability
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can delete their own availability" ON public.doctor_availability;
CREATE POLICY "Doctors can delete their own availability"
  ON public.doctor_availability
  FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());

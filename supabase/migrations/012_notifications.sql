-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Phase 3/4 Notifications
-- Migration: 012_notifications.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'notification_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.notification_type AS ENUM (
      'relationship_request_received',
      'relationship_request_accepted',
      'relationship_request_rejected',
      'appointment_requested',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_rejected',
      'prescription_created',
      'consultation_note_added'
    );
  END IF;
END $$;

-- ─── Table: notifications ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  type                public.notification_type NOT NULL,
  related_entity_id   UUID,
  is_read             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON public.notifications(is_read);

-- ─── Triggers ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_updated_at ON public.notifications;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS Policies ───────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Note: We intentionally omit an INSERT policy. Notifications are triggered
-- by other users (e.g., patient requests appointment -> doctor gets notified).
-- The application's DAL will use the Supabase Admin Client (Service Role)
-- to bypass RLS and insert notifications securely.

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

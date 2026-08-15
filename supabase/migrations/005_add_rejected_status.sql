-- Migration: 005_add_rejected_status.sql
-- Adds 'rejected' to the relationship_status ENUM and updates triggers.

ALTER TYPE public.relationship_status ADD VALUE IF NOT EXISTS 'rejected';

CREATE OR REPLACE FUNCTION public.set_relationship_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Record the moment this relationship became active
  IF NEW.status = 'active' AND OLD.status <> 'active' THEN
    NEW.established_at = now();
  END IF;

  -- Record the moment this relationship was revoked or rejected (terminal states)
  IF NEW.status IN ('revoked', 'rejected') AND OLD.status NOT IN ('revoked', 'rejected') THEN
    NEW.revoked_at = now();
  END IF;

  RETURN NEW;
END;
$$;

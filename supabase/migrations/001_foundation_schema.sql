-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Foundation Schema
-- Migration: 001_foundation_schema.sql
-- Creates: enums, tables (profiles, doctors, doctor_patient_relationships),
--          and all indexes.
-- Idempotent: safe to re-run.
--
-- Corrections applied vs. earlier draft:
--   1. doctor_patient_relationships.initiated_by is nullable (supports SET NULL)
--   2. UNIQUE (doctor_id, patient_id) replaced with partial unique index
--      covering only status IN ('active','pending') — allows re-establishment
--      after revocation.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────────────────────
-- DO blocks used because PostgreSQL has no CREATE TYPE IF NOT EXISTS.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'user_role'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'gender'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.gender AS ENUM (
      'male', 'female', 'other', 'prefer_not_to_say'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'relationship_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.relationship_status AS ENUM (
      'pending', 'active', 'inactive', 'revoked'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'initiator_role'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.initiator_role AS ENUM ('doctor', 'patient');
  END IF;
END $$;

-- NOTE: blood_type enum deferred with patient_profiles (Phase 3).

-- ─── Table: profiles ─────────────────────────────────────────────────────
-- profiles.id = auth.users.id  (1:1, no DEFAULT — assigned from Auth)
-- ON DELETE CASCADE: removing auth user removes their entire profile.

CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID                 PRIMARY KEY
                                        REFERENCES auth.users(id)
                                        ON DELETE CASCADE,
  role           public.user_role     NOT NULL DEFAULT 'patient',
  full_name      TEXT                 NOT NULL
                                        CONSTRAINT profiles_full_name_min_length
                                          CHECK (char_length(full_name) >= 2),
  avatar_url     TEXT,
  phone          TEXT,
  date_of_birth  DATE,
  gender         public.gender,
  is_active      BOOLEAN              NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- ─── Table: doctors ──────────────────────────────────────────────────────
-- doctors.id: generated UUID (gen_random_uuid())
-- doctors.profile_id: ON DELETE CASCADE — doctor record removed with profile
-- doctors.verified_by: ON DELETE SET NULL — admin deletion preserves the
--   doctor record; verifier reference becomes NULL (history still visible)

CREATE TABLE IF NOT EXISTS public.doctors (
  id                   UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id           UUID              NOT NULL
                                           UNIQUE
                                           REFERENCES public.profiles(id)
                                           ON DELETE CASCADE,
  license_number       TEXT              NOT NULL UNIQUE,
  specialty            TEXT              NOT NULL,
  department           TEXT,
  years_of_experience  INTEGER
                         CONSTRAINT doctors_years_non_negative
                           CHECK (years_of_experience IS NULL
                               OR years_of_experience >= 0),
  bio                  TEXT,
  is_verified          BOOLEAN           NOT NULL DEFAULT false,
  verified_by          UUID              REFERENCES public.profiles(id)
                                           ON DELETE SET NULL,
  verified_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- ─── Table: doctor_patient_relationships ─────────────────────────────────
-- id:           generated UUID (gen_random_uuid())
-- doctor_id:    ON DELETE CASCADE — doctor profile deletion removes relationships
-- patient_id:   ON DELETE CASCADE — patient profile deletion removes relationships
-- initiated_by: ON DELETE SET NULL — initiator deletion preserves the
--               relationship record for the other party's history; nullable
-- revoked_by:   ON DELETE SET NULL — revoker deletion preserves history
--
-- NO full UNIQUE (doctor_id, patient_id) — would prevent re-establishment
-- after revocation. Replaced by partial unique index below (only active/pending).

CREATE TABLE IF NOT EXISTS public.doctor_patient_relationships (
  id               UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id        UUID                       NOT NULL
                                                REFERENCES public.profiles(id)
                                                ON DELETE CASCADE,
  patient_id       UUID                       NOT NULL
                                                REFERENCES public.profiles(id)
                                                ON DELETE CASCADE,
  status           public.relationship_status NOT NULL DEFAULT 'pending',
  initiated_by     UUID                       -- nullable: SET NULL on initiator deletion
                                                REFERENCES public.profiles(id)
                                                ON DELETE SET NULL,
  initiator_role   public.initiator_role      NOT NULL,
  established_at   TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ,
  revoked_by       UUID                       REFERENCES public.profiles(id)
                                                ON DELETE SET NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ                NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ                NOT NULL DEFAULT now(),

  -- No self-relationship allowed
  CONSTRAINT dpr_no_self_relation
    CHECK (doctor_id <> patient_id)
);

-- ─── Indexes: profiles ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_is_active
  ON public.profiles(is_active);

-- ─── Indexes: doctors ─────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_doctors_profile_id
  ON public.doctors(profile_id);

CREATE INDEX IF NOT EXISTS idx_doctors_is_verified
  ON public.doctors(is_verified);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty
  ON public.doctors(specialty);

-- ─── Indexes: doctor_patient_relationships ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_dpr_doctor_id
  ON public.doctor_patient_relationships(doctor_id);

CREATE INDEX IF NOT EXISTS idx_dpr_patient_id
  ON public.doctor_patient_relationships(patient_id);

CREATE INDEX IF NOT EXISTS idx_dpr_status
  ON public.doctor_patient_relationships(status);

-- Composite index covers the RLS EXISTS subquery in a single index scan
CREATE INDEX IF NOT EXISTS idx_dpr_doctor_patient_status
  ON public.doctor_patient_relationships(doctor_id, patient_id, status);

-- PARTIAL UNIQUE INDEX: prevents duplicate active or pending relationships
-- between the same doctor-patient pair, while allowing multiple historical
-- (revoked/inactive) rows. This enables re-establishment after revocation.
CREATE UNIQUE INDEX IF NOT EXISTS udx_dpr_active_pending
  ON public.doctor_patient_relationships(doctor_id, patient_id)
  WHERE status IN ('active', 'pending');

-- ═══════════════════════════════════════════════════════════════════════════
-- SmartCare — Supabase Storage RLS Policies
-- Migration: 004_storage_policies.sql
-- Bucket: avatars (private, must be created in Dashboard first)
--
-- Policy design:
--   - Users upload ONLY to their own folder: <user_id>/
--   - Users download ONLY their own avatar
--   - Authenticated users can view verified doctors' avatars (for directory)
--   - Patients with an active/pending relationship can view their doctor's avatar
--
-- Idempotent: DROP POLICY IF EXISTS before every CREATE POLICY.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── INSERT (upload) ──────────────────────────────────────────────────────────
-- User may only upload to a path that starts with their own user ID.
-- Path format: <user_id>/avatar.<ext>

DROP POLICY IF EXISTS "avatar_insert_own" ON storage.objects;
CREATE POLICY "avatar_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── UPDATE (upsert) ─────────────────────────────────────────────────────────
-- Allows overwriting own avatar (upsert = true in uploadAvatarAction).

DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
CREATE POLICY "avatar_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── SELECT (download / signed URL) ──────────────────────────────────────────

-- 1. Users can always read their own avatar
DROP POLICY IF EXISTS "avatar_select_own" ON storage.objects;
CREATE POLICY "avatar_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Any authenticated user can view verified doctors' avatars (doctor directory)
DROP POLICY IF EXISTS "avatar_select_verified_doctor" ON storage.objects;
CREATE POLICY "avatar_select_verified_doctor"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.doctors d ON d.profile_id = p.id
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.role = 'doctor'
        AND d.is_verified = true
    )
  );

-- 3. Patient can view their doctor's avatar when a pending or active relationship exists
DROP POLICY IF EXISTS "avatar_select_relationship" ON storage.objects;
CREATE POLICY "avatar_select_relationship"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.doctor_patient_relationships dpr
      WHERE dpr.patient_id = auth.uid()
        AND dpr.doctor_id::text = (storage.foldername(name))[1]
        AND dpr.status IN ('active', 'pending')
    )
  );

-- ─── DELETE ───────────────────────────────────────────────────────────────────
-- Users may delete (replace) their own avatar.

DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;
CREATE POLICY "avatar_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

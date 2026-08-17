-- supabase/seed.sql
-- Seed script for Local Testing (Playwright / Dev Database)
-- Standard Password for all test users: TestPassword123!

-- 1. Create test users in auth.users
-- Note: We use raw SQL inserts into auth.users to simulate registered users.
-- The auth.users table might require encrypted passwords. For simplicity in local testing,
-- Supabase CLI often intercepts this or we use a known hash. In standard Supabase seed,
-- we provide the encrypted_password hash for "TestPassword123!".
-- Hash for "TestPassword123!" using standard Supabase Bcrypt:
-- $2a$10$wA.4xN//hYV.N0Xq3lF/Z.D22lB2.34m4e.Z8v.2.s2wN13C.b11O

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'admin@smartcare.test', '$2a$10$wA.4xN//hYV.N0Xq3lF/Z.D22lB2.34m4e.Z8v.2.s2wN13C.b11O', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'patient@smartcare.test', '$2a$10$wA.4xN//hYV.N0Xq3lF/Z.D22lB2.34m4e.Z8v.2.s2wN13C.b11O', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'doctor@smartcare.test', '$2a$10$wA.4xN//hYV.N0Xq3lF/Z.D22lB2.34m4e.Z8v.2.s2wN13C.b11O', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Create corresponding profiles
-- Note: the 'handle_new_user' trigger might have already created these. We use DO UPDATE to ensure roles.
INSERT INTO public.profiles (id, full_name, role, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Admin', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'Test Patient', 'patient', true),
  ('33333333-3333-3333-3333-333333333333', 'Test Doctor', 'doctor', true)
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 3. Create a pending doctor profile for the admin to approve
INSERT INTO public.doctors (id, profile_id, specialty, license_number, is_verified, verification_status)
VALUES
  ('d1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Cardiology', 'LIC-12345', false, 'pending')
ON CONFLICT (id) DO NOTHING;

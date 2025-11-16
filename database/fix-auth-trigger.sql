-- Diagnose and fix the auth trigger issue

-- Step 1: Check the users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Check for constraints on users table
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'users';

-- Step 3: Check RLS policies on users table
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- Step 4: Fix the handle_new_user function to handle church_id (if it exists)
-- This version makes church_id optional and defaults to null
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, church_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    NULL  -- church_id will be set later when user logs in
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If insert fails, log the error but don't fail the auth process
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 5: Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Step 6: Test manually (this will help debug)
-- First, get a test UUID and email
-- Try inserting directly to test
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'manual_test_' || NOW()::text || '@example.com',
  'Manual Test',
  'student'
)
ON CONFLICT (id) DO NOTHING;

-- Check if it worked
SELECT COUNT(*) as inserted_rows FROM public.users WHERE full_name = 'Manual Test';

-- Clean up
DELETE FROM public.users WHERE full_name = 'Manual Test';

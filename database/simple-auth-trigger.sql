-- Simple, robust auth trigger function
-- This handles the case where full_name might be missing

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Get full_name from metadata, fallback to email if not provided
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );

  -- If full_name is somehow null or empty, use email
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := NEW.email;
  END IF;

  -- Insert the user
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log error for debugging
  RAISE NOTICE 'Error creating user profile: % %', SQLSTATE, SQLERRM;
  -- Still return NEW to allow auth to succeed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verify function was created
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user' LIMIT 1;

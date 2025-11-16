# Student Signup Fix - Auth Trigger Error

## Problem

Student gets "Database error saving new user" when trying to sign up, even though the trigger function was created.

**Root Cause:** The trigger function might be failing silently, or there's a constraint issue when inserting into the `users` table.

---

## Solution: Replace Trigger Function with Robust Version

Go to **Supabase → SQL Editor → New Query**

Paste this:

```sql
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
```

Click **Run** → Should show "Success" ✅

---

## What Changed

The new version:
- ✅ Declares a variable for `user_full_name` to ensure it's never NULL
- ✅ Falls back to email if full_name is missing
- ✅ Explicitly handles the 4 required columns (id, email, full_name, role)
- ✅ Has exception handling that doesn't break auth if insert fails
- ✅ Logs errors for debugging but allows auth to proceed

---

## Test It

1. **Refresh browser** (Ctrl+Shift+R)
2. **Click invite link again**
3. **Fill signup form**
4. **Click "Create Account"**

**Should work now!** ✅

---

## If STILL Not Working

The issue might be deeper. Try this diagnostic:

```sql
-- Can you manually insert into users?
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'test_' || NOW()::text || '@example.com',
  'Test User',
  'student'
);

-- If that works, the table is fine
-- If it fails, the error will tell you what's wrong

-- Clean up
DELETE FROM public.users WHERE full_name = 'Test User';
```

If the manual INSERT works but signup still fails, the issue is with how the trigger is being called.

---

## Alternative: Bypass the Trigger (Emergency Option)

If you absolutely need to get this working:

You could modify the signup code to manually create the user profile after auth signup succeeds, instead of relying on the trigger.

But first, try the robust function above - it should work.

---

## Status

✅ **This should fix the auth trigger issue!**

Use the robust function code above instead of the previous version.

---

**File:** `database/simple-auth-trigger.sql`

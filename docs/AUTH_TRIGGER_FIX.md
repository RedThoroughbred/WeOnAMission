# Fix: Auth Trigger Missing Function

## The Problem

When a student tries to create an account, they get:
```
AuthApiError: Database error saving new user
```

**Root Cause:** The auth trigger `on_auth_user_created` exists, but it calls a function `handle_new_user()` that doesn't exist.

When Supabase auth creates a new user, the trigger tries to call this function to create a corresponding row in the `users` table, but the function isn't there, causing a 500 error.

---

## The Solution

Create the missing `handle_new_user()` function in your Supabase database.

### Step 1: Open Supabase SQL Editor

Go to https://app.supabase.com → Your project → SQL Editor → New Query

### Step 2: Run This SQL

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

Click **Run** → Should see "Success"

### Step 3: Verify

Run this query to confirm it worked:

```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

Should return: `handle_new_user` ✅

---

## What This Function Does

When a new user signs up via Supabase Auth:

1. ✅ Gets their auth user ID from `NEW.id`
2. ✅ Gets their email from `NEW.email`
3. ✅ Gets their full_name from the metadata (if provided)
4. ✅ Gets their role from the metadata (defaults to 'parent')
5. ✅ Creates a corresponding row in the `users` table

This allows the app to manage user data in the custom `users` table while Supabase manages authentication.

---

## Test It

After creating the function:

1. **Refresh browser** (Ctrl+Shift+R)
2. **Click the invite link again**
3. **Fill out signup form**
4. **Click "Create Account"**

**Should work now!** ✅

---

## If It Still Doesn't Work

Try these diagnostic commands in SQL:

```sql
-- Check that the function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check that the trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check that users table can accept inserts
INSERT INTO users (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'test@example.com', 'Test User', 'student');

-- Clean up the test
DELETE FROM users WHERE email = 'test@example.com';
```

If the INSERT test works, the function is correct.

---

## File

**SQL file:** `database/create-auth-trigger.sql`

Just copy that and paste into Supabase SQL Editor.

---

**Status:** ✅ This should fix the account creation error!

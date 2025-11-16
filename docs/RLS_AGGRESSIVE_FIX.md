# RLS Aggressive Fix - Permission Still Denied

If you already ran the basic RLS fix and still getting "permission denied" error, use this aggressive approach.

## The Problem

Even after running the RLS policies, you're still getting:
```
Error: permission denied for table student_invites
```

This means:
- The policies might not have been created
- The policies exist but are too restrictive
- There's a syntax issue in the policies
- The table RLS state is confused

## The Solution

We'll completely disable RLS, delete all policies, then re-create it from scratch.

### Step 1: Run the Aggressive Fix SQL

Go to Supabase → SQL Editor → New Query

Copy and paste this SQL:

```sql
-- Step 1: Disable RLS completely
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Parents can view their own invites" ON student_invites;
DROP POLICY IF EXISTS "Parents can create invites" ON student_invites;
DROP POLICY IF EXISTS "Admins can view church invites" ON student_invites;
DROP POLICY IF EXISTS "Allow all operations" ON student_invites;
DROP POLICY IF EXISTS "Allow authenticated users" ON student_invites;

-- Step 3: Re-enable RLS
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple policy that allows authenticated users
CREATE POLICY "Allow authenticated users" ON student_invites
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Verify it worked
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'student_invites';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'student_invites';
```

### Step 2: Click Run

Should see "Success" and verify output showing:
- `rowsecurity = true`
- One policy: "Allow authenticated users"

### Step 3: Test the Feature

1. Refresh browser (Ctrl+Shift+R)
2. Click "Send Invite" button
3. Enter student email
4. Click "Send Invite"

**Should work now!** ✅

---

## If It Works

Great! The issue was the RLS policies. Now we can make them more secure by replacing the temporary permissive policy with proper parent/admin policies.

### Step 4: Apply Proper Security (Optional but Recommended)

Once it works, replace the temporary policy with proper ones:

```sql
-- Drop the temporary permissive policy
DROP POLICY "Allow authenticated users" ON student_invites;

-- Create proper restrictive policies
CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    USING (auth.role() = 'authenticated')
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Admins can view all invites"
    ON student_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
            AND users.church_id = student_invites.church_id
        )
    );
```

---

## Why This Works

The aggressive approach:

1. **Disables RLS temporarily** - Clears any conflicting state
2. **Deletes all policies** - Removes any incorrect or partial policies
3. **Re-enables RLS** - Fresh start
4. **Creates a simple permissive policy** - Allows any authenticated user
5. **Tests the feature** - Confirms the issue was RLS

If this simple permissive policy works, then we know:
- ✅ The table is fine
- ✅ RLS works when properly configured
- ✅ The previous policies had an issue

Then you can apply the more restrictive proper policies.

---

## Common Issues This Fixes

| Issue | What Happened | Fixed By |
|-------|---------------|----------|
| "permission denied" | Policies were incomplete | Drop all, recreate |
| "policy not found" | RLS state was confused | Disable then re-enable |
| "syntax error" | Policy had typo | Drop and recreate with correct syntax |
| "role error" | Policy referenced wrong role | Create with `auth.role() = 'authenticated'` |

---

## Step by Step

1. ✅ Open Supabase SQL Editor
2. ✅ Run the aggressive fix SQL (from above)
3. ✅ Verify: See "rowsecurity = true" and policy listed
4. ✅ Refresh browser
5. ✅ Test invite button - should work!

---

## If Still Not Working

### Check 1: Are you logged in?
Make sure you're logged into the parent portal with a parent user account.

### Check 2: Is the table really there?
Run in SQL Editor:
```sql
SELECT COUNT(*) FROM student_invites;
```

If error "relation does not exist", the migration didn't run.

### Check 3: Run Diagnostic Query
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'student_invites';

-- List all policies
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'student_invites';

-- Try a test insert (will fail if permissions wrong, but shows the real error)
INSERT INTO student_invites
(student_id, parent_id, church_id, invite_token, student_email, status)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    auth.uid(),
    '00000000-0000-0000-0000-000000000002'::uuid,
    'test_' || NOW()::text,
    'test@example.com',
    'pending'
);
```

The INSERT will probably fail but will tell you the exact issue.

---

## Summary

| Step | Command | Expected Result |
|------|---------|-----------------|
| Disable RLS | `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` | No error |
| Delete policies | `DROP POLICY IF EXISTS ...` | No errors |
| Enable RLS | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` | No error |
| Create policy | `CREATE POLICY ...` | Success |
| Test button | Click "Send Invite" | Works or clear error |

---

## Files

- `database/fix-rls-aggressive.sql` - The aggressive fix SQL
- `database/check-rls-status.sql` - Diagnostic queries

---

**Status:** Feature should work after running the aggressive fix!

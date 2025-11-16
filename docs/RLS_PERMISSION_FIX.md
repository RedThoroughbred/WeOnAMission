# Fix: Permission Denied for Table student_invites

## Error

```
Error sending invite: {code: '42501', message: 'permission denied for table student_invites'}
```

## What This Means

The `student_invites` table exists ✅, but Row-Level Security (RLS) policies aren't allowing your user to INSERT into it.

This happens when:
1. RLS policies didn't get created properly
2. The policies are too restrictive
3. Your user role isn't recognized correctly

---

## Solution: Fix RLS Policies

### Step 1: Open Supabase SQL Editor

- Go to https://app.supabase.com
- Select your project
- Click "SQL Editor"
- Click "New Query"

### Step 2: Copy the Fix SQL

Use the file: `database/fix-rls-policies.sql`

Copy the entire content and paste into Supabase SQL Editor.

**OR copy this directly:**

```sql
-- Drop existing policies (they may be incorrect)
DROP POLICY IF EXISTS "Parents can view their own invites" ON student_invites;
DROP POLICY IF EXISTS "Parents can create invites" ON student_invites;
DROP POLICY IF EXISTS "Admins can view church invites" ON student_invites;

-- Enable RLS
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- Policy 1: Parents can view their own invites
CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

-- Policy 2: Parents can INSERT invites
CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- Policy 3: Admins can view all invites in their church
CREATE POLICY "Admins can view church invites"
    ON student_invites FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Step 3: Run the SQL

Click "Run" button in Supabase.

Should complete with **Success** messages (no red errors).

### Step 4: Verify Success

Run this verification query:

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'student_invites';
```

**Should show:**
```
tablename          | rowsecurity
student_invites    | true
```

### Step 5: Verify Policies

Run this to check all policies:

```sql
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'student_invites'
ORDER BY policyname;
```

**Should show 3 rows:**
1. "Admins can view church invites"
2. "Parents can create invites"
3. "Parents can view their own invites"

### Step 6: Test the Feature

1. Refresh your browser (Ctrl+Shift+R)
2. Click "Send Invite" button
3. Enter student email
4. Click "Send Invite"

**Should now work! ✅**

---

## If It Still Doesn't Work

### Check 1: Verify You're Logged In as Parent

The policy checks `parent_id = auth.uid()`, which means:
- The logged-in user's ID must match the parent_id being inserted
- The system automatically sets `parent_id` to the current user

**Verify you're logged in:**
1. Check the parent portal shows your name
2. Make sure you have "parent" role (not "admin" or "student")

### Check 2: Run Complete Diagnostic

In Supabase SQL Editor, run:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'student_invites';

-- Check all policies
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'student_invites';

-- Try inserting a test record (replace with real IDs)
INSERT INTO student_invites
(student_id, parent_id, church_id, invite_token, student_email, status)
VALUES (
    'YOUR_STUDENT_ID_HERE',
    'YOUR_CURRENT_USER_ID_HERE',
    'YOUR_CHURCH_ID_HERE',
    'test_token_' || NOW()::text,
    'test@example.com',
    'pending'
);
```

If the INSERT fails with permission error, the RLS policy still isn't right.

### Check 3: Disable RLS Temporarily (For Testing Only)

To test if RLS is the problem, you can temporarily disable it:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;
```

Then try the invite button. If it works, RLS was the issue.

**Then re-enable it:**
```sql
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;
```

### Check 4: Use Supabase Dashboard

Instead of SQL, you can also set RLS policies in the UI:

1. Go to Supabase → Tables
2. Click on `student_invites` table
3. Go to "Authentication" tab
4. Click "Enable RLS"
5. Click "New Policy"
6. Add the policies manually via the UI

---

## Understanding RLS Policies

The three policies we created:

| Policy | Type | Allows | Condition |
|--------|------|--------|-----------|
| **Parents can view their own invites** | SELECT | Parents to read | `parent_id = auth.uid()` |
| **Parents can create invites** | INSERT | Parents to insert | `parent_id = auth.uid()` |
| **Admins can view church invites** | SELECT | Admins to read all | User is admin in that church |

**Key Point:** The INSERT policy automatically sets `parent_id` to the logged-in user, so the `WITH CHECK (parent_id = auth.uid())` ensures they can only create invites as themselves.

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Policy doesn't allow INSERT | Missing INSERT policy | Add "Parents can create invites" policy |
| Policy too restrictive | Wrong WHERE clause | Use `parent_id = auth.uid()` |
| RLS not enabled | Table created without RLS | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| User can't see invites | Missing SELECT policy | Add "Parents can view their own invites" policy |

---

## Files

**Main migration:** `database/student-enrollment-setup.sql`
**Fix file:** `database/fix-rls-policies.sql`

---

## Step-by-Step Summary

1. ✅ Go to Supabase SQL Editor
2. ✅ Paste the RLS fix SQL
3. ✅ Click Run
4. ✅ Verify with diagnostic queries
5. ✅ Refresh browser
6. ✅ Test invite button
7. ✅ Should work now! ✅

---

## If Everything Else Fails

Contact Supabase support with:
- Project URL
- Table name: `student_invites`
- Error code: 42501
- Error message: "permission denied for table student_invites"

They can help debug the RLS configuration.

---

## Success Indicators

✅ RLS enabled on `student_invites` table
✅ 3 policies exist (SELECT, INSERT, SELECT)
✅ "Parents can create invites" policy in place
✅ Browser refreshed
✅ "Send Invite" button works
✅ Modal shows success or database error
✅ NOT getting 42501 permission error

**Status:** Feature should be working now!

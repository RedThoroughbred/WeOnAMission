# Quick Fix: Permission Denied Error

## The Error You're Getting

```
Error sending invite: {code: '42501', message: 'permission denied for table student_invites'}
```

## What It Means

The table exists ✅, but Row-Level Security policies aren't set up correctly.

## Quick Fix (5 minutes)

### Step 1: Open Supabase
https://app.supabase.com → Select your project → SQL Editor → New Query

### Step 2: Run This SQL

```sql
DROP POLICY IF EXISTS "Parents can view their own invites" ON student_invites;
DROP POLICY IF EXISTS "Parents can create invites" ON student_invites;
DROP POLICY IF EXISTS "Admins can view church invites" ON student_invites;

ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can view church invites"
    ON student_invites FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Step 3: Click Run

Wait for "Success" message.

### Step 4: Refresh Browser & Test

- Ctrl+Shift+R to refresh
- Click "Send Invite" button
- Enter email
- Click "Send Invite"
- Should work now! ✅

---

## What This Does

Removes any incorrect RLS policies and creates the correct ones that allow:
- ✅ Parents to create invites
- ✅ Parents to view their own invites
- ✅ Admins to view all invites

---

## Alternative: Use the Fix File

Instead of copying the SQL above, you can use:
**File:** `database/fix-rls-policies.sql`

Copy that entire file and paste into Supabase SQL Editor.

---

## For More Details

See: `RLS_PERMISSION_FIX.md`

This has:
- Detailed explanations
- Verification queries
- Troubleshooting steps
- Common issues & solutions

---

**Time to fix:** 5 minutes
**Expected result:** Invite button works ✅

# CRITICAL: Database Migration Required for Student Invites

## Overview

The "Send Invite" button feature requires a new database table that needs to be created in your Supabase database. Without this migration, the invite functionality will not work.

## What's Missing

The `student_invites` table needs to be created to store:
- Invite tokens (unique, one-time use)
- Student information
- Parent information
- Church context
- Invite status and expiration

## How to Set Up

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. **Open your Supabase project:**
   - Go to https://app.supabase.com
   - Select your project
   - Go to the "SQL Editor" tab

2. **Run the migration SQL:**
   - Click "New Query"
   - Copy the entire contents of `database/student-enrollment-setup.sql`
   - Paste into the SQL editor
   - Click "Run"
   - You should see "Success" messages

3. **Verify it worked:**
   - Go to the "Tables" tab
   - You should see `student_invites` table in the list
   - Click on it to see the columns

### Option 2: Using the SQL file (For developers)

```bash
# If using supabase CLI (if installed)
supabase db push

# Or manually through the dashboard as shown in Option 1
```

## The SQL Migration

Here's what gets created:

```sql
-- Add user_id column to students table
ALTER TABLE students
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create student_invites table
CREATE TABLE IF NOT EXISTS student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Enable RLS
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for parents
CREATE POLICY "parents_see_own_church_invites" ON student_invites
FOR SELECT USING (
    auth.uid() = parent_id AND
    church_id = (SELECT church_id FROM users WHERE id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_student_invites_token ON student_invites(invite_token);
CREATE INDEX idx_student_invites_student ON student_invites(student_id);
CREATE INDEX idx_student_invites_church ON student_invites(church_id);
```

## File Location

The complete SQL file is located at:
```
database/student-enrollment-setup.sql
```

## Troubleshooting

### Error: "relation 'student_invites' does not exist"

**Cause:** The migration hasn't been run yet

**Solution:**
1. Follow the setup steps above
2. Make sure you're connected to the right database
3. Run the SQL file in Supabase dashboard

### Error: "column 'user_id' already exists on table 'students'"

**Cause:** The migration was partially completed or duplicate attempt

**Solution:**
1. This is fine - the column already exists
2. Try running just the `CREATE TABLE` portion if the column already exists
3. Or run the full migration - SQL will skip already-existing objects

### Error: "foreign key constraint failed"

**Cause:** Dependencies not set up correctly

**Solution:**
1. Make sure `students` table exists
2. Make sure `users` table exists
3. Make sure `churches` table exists
4. These should all exist already since the app is running

## Verification

After running the migration, verify it worked:

1. **Check in Supabase dashboard:**
   - Go to Tables
   - Look for `student_invites` table
   - Should see columns: id, student_id, parent_id, church_id, invite_token, student_email, status, created_at, expires_at, accepted_at

2. **Test the invite button:**
   - Open parent portal
   - Click "Send Invite" button
   - Enter student email
   - Should see success message with invite link
   - Should NOT see: "The student_invites table hasn't been set up yet"

## Next Steps

Once the migration is complete:

1. ✅ Parents can click "Send Invite" button
2. ✅ Invite links will be generated
3. ✅ Students can click invite links to sign up
4. ✅ Accounts will be automatically linked

## Questions?

If you get an error running the migration:

1. **Copy the entire error message**
2. **Check the file:** `database/student-enrollment-setup.sql`
3. **Verify you're in the right Supabase project**
4. **Make sure you have admin access to the database**

---

**Status:** ⏳ Waiting for database migration to be run

**Instructions File:** [student-enrollment-setup.sql](../database/student-enrollment-setup.sql)

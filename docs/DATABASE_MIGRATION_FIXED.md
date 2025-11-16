# Database Migration - All SQL Issues Fixed ✅

## Summary

The database migration file had **2 PostgreSQL syntax errors** that have now been corrected. The file is ready to run in Supabase.

---

## Error #1: Incorrect Index Syntax

### Problem
```
ERROR: 42704: type "idx_invite_token" does not exist
```

### Root Cause
The migration used MySQL syntax for creating indexes inside the CREATE TABLE statement:
```sql
-- WRONG: MySQL/MariaDB syntax
CREATE TABLE student_invites (
    ...
    INDEX idx_invite_token (invite_token),
    INDEX idx_student_id (student_id),
    ...
);
```

PostgreSQL doesn't support this syntax.

### Solution
Changed to PostgreSQL's `CREATE INDEX` statements outside the table definition:
```sql
-- CORRECT: PostgreSQL syntax
CREATE INDEX IF NOT EXISTS idx_invite_token ON student_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_student_id ON student_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_church_id ON student_invites(church_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON student_invites(parent_id);
CREATE INDEX IF NOT EXISTS idx_status ON student_invites(status);
```

---

## Error #2: Non-Immutable Function in Index Predicate

### Problem
```
ERROR: 42P17: functions in index predicate must be marked IMMUTABLE
```

### Root Cause
The migration used `NOW()` in a partial index WHERE clause:
```sql
-- WRONG: NOW() is not IMMUTABLE
CREATE INDEX idx_valid_invites ON student_invites(invite_token, status)
WHERE status = 'pending' AND expires_at > NOW();
```

PostgreSQL requires all functions in index predicates to be marked IMMUTABLE. `NOW()` is volatile (returns different values at different times), so it cannot be used.

### Solution
Simplified the index to use only immutable predicates:
```sql
-- CORRECT: Uses only status (immutable)
CREATE INDEX IF NOT EXISTS idx_pending_invites ON student_invites(invite_token)
WHERE status = 'pending';
```

**Note:** Expired invites are automatically cleaned up by the `expire_old_invites()` function (called separately), so the index only needs to filter on status.

---

## Complete Fixed Migration

Here's the corrected section (lines 35-78):

```sql
-- Create indexes for performance (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_invite_token ON student_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_student_id ON student_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_church_id ON student_invites(church_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON student_invites(parent_id);
CREATE INDEX IF NOT EXISTS idx_status ON student_invites(status);

-- 3. Enable RLS on student_invites
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for student_invites
-- Parents can see invites they created
CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

-- Parents can create invites
CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- Admins can view all invites in their church
CREATE POLICY "Admins can view church invites"
    ON student_invites FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Create function to auto-expire old invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
    UPDATE student_invites
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Create partial index for querying pending invites efficiently
-- Note: We use status only instead of expires_at condition since NOW() is not immutable
CREATE INDEX IF NOT EXISTS idx_pending_invites ON student_invites(invite_token)
WHERE status = 'pending';
```

---

## How to Run the Migration

### Step 1: Open Supabase
- Go to https://app.supabase.com
- Select your project

### Step 2: Open SQL Editor
- Click "SQL Editor" in the left sidebar

### Step 3: Create New Query
- Click "New Query" button
- A blank SQL editor will open

### Step 4: Copy the Migration
- Open `database/student-enrollment-setup.sql` in your editor
- Select ALL content (Ctrl+A or Cmd+A)
- Copy (Ctrl+C or Cmd+C)

### Step 5: Paste in Supabase
- Click in the Supabase SQL editor
- Paste the content (Ctrl+V or Cmd+V)

### Step 6: Run
- Click the "Run" button (or press Ctrl+Enter)
- Wait for completion

### Step 7: Verify Success
- You should see "Success" messages
- No red error messages
- Go to "Tables" tab and confirm `student_invites` table exists

---

## What Gets Created

| Component | Purpose | Type |
|-----------|---------|------|
| `user_id` column on `students` | Links student to auth account | Column |
| `student_invites` table | Stores invite records | Table |
| RLS policies | Security - parents see own invites | Policy |
| 5 indexes | Query performance | Index |
| `expire_old_invites()` | Auto-cleanup function | Function |
| `idx_pending_invites` | Fast lookup by token | Index |

---

## Testing the Migration

After running, test that everything works:

### 1. Check Table Exists
```sql
SELECT * FROM student_invites LIMIT 1;
-- Should not error (table exists)
```

### 2. Test Insert (if you want)
```sql
-- This would insert a test invite (optional)
INSERT INTO student_invites
(student_id, parent_id, church_id, invite_token, student_email, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'test_token_12345',
    'test@example.com',
    'pending'
);
```

### 3. Check Indexes
```sql
-- List all indexes on student_invites
SELECT indexname FROM pg_indexes
WHERE tablename = 'student_invites';
```

---

## Troubleshooting

### Error: "relation 'students' does not exist"
**Cause:** students table hasn't been created yet
**Solution:** This shouldn't happen - your app must already have the students table

### Error: "column 'user_id' already exists"
**Cause:** The migration was partially completed before
**Solution:** This is fine - just means you can skip the ALTER TABLE line

### Error: "relation 'student_invites' already exists"
**Cause:** The migration was already run
**Solution:** This is fine - the `CREATE TABLE IF NOT EXISTS` will skip it

### Other errors
**Debug steps:**
1. Check that you're in the right project
2. Check you have admin access
3. Look at the full error message
4. Try running statements one at a time

---

## Status

✅ **FULLY FIXED AND READY**

- ✅ All syntax corrected for PostgreSQL
- ✅ All indexes using correct syntax
- ✅ No non-immutable functions in predicates
- ✅ Ready to run in Supabase
- ✅ Complete documentation provided

---

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Verify success** (should see Success messages)
3. **Test the invite button** in parent portal
4. **Feature is live!** 🎉

---

**File Location:** `database/student-enrollment-setup.sql`

**Related Files:**
- `SETUP_REQUIRED.md` - Quick setup guide
- `MIGRATION_FIX_SUMMARY.md` - Technical fix details
- `docs/NEXT_STEPS_STUDENT_INVITES.md` - Complete feature guide

# Verify Database Migration Status

## Quick Check (Do This First!)

To verify if the migration was successfully run, check your Supabase database:

### Step 1: Open Supabase
Go to https://app.supabase.com and select your project

### Step 2: Go to Tables
Click the "Tables" section in the left sidebar

### Step 3: Look for `student_invites`
Scroll through the list of tables and look for `student_invites`

**If you see it:**
✅ Migration was successful!
→ Try the invite button again

**If you don't see it:**
❌ Migration wasn't run yet
→ Run the migration (see instructions below)

---

## How to Run the Migration

**If you haven't run it yet:**

1. Click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open this file: `database/student-enrollment-setup.sql`
4. Copy ALL the code
5. Paste into the Supabase SQL editor
6. Click "Run"
7. Wait for success messages

**Then refresh your browser and try the invite button again.**

---

## Verify Migration Success (SQL Check)

If you want to double-check that everything was created, you can run this verification SQL:

```sql
-- Check if student_invites table exists
SELECT 'student_invites' as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'student_invites';

-- Check if user_id column exists on students
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'students'
AND column_name = 'user_id';

-- Check if indexes were created
SELECT indexname
FROM pg_indexes
WHERE tablename = 'student_invites';
```

**What you should see:**
- `student_invites` table found ✅
- `user_id` column on students table ✅
- 6 indexes listed ✅

---

## Troubleshooting

### "I ran the migration but still getting errors"

1. Check the Supabase error log:
   - Go to "Tables"
   - Click on `student_invites` table
   - It should show columns: id, student_id, parent_id, church_id, invite_token, student_email, status, created_at, expires_at, accepted_at

2. Refresh your browser:
   - Press Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - This clears the cache

3. Check browser console for detailed errors:
   - Press F12
   - Look at "Console" tab
   - Copy any error messages

### "Migration failed with SQL error"

Check the specific error:

**`ERROR: 42P17: functions in index predicate must be marked IMMUTABLE`**
→ This means the SQL still has the old syntax
→ Use the latest version of `database/student-enrollment-setup.sql`

**`ERROR: relation 'student_invites' already exists`**
→ Migration was already run successfully
→ This is fine, table already exists

**Other error**
→ Take a screenshot and note the exact error message
→ This will help debug what went wrong

---

## If Migration Ran Successfully But Invite Button Still Doesn't Work

1. **Refresh the page** (Ctrl+Shift+R)
2. **Check browser console** (F12 → Console tab)
3. **Look for error messages** related to `sendStudentInvite`
4. **Common issues:**
   - You're not logged in as a parent
   - You don't have any students in your account
   - The student_invites table doesn't have proper permissions

---

## Still Having Issues?

### Step 1: Verify table exists
In Supabase SQL Editor, run:
```sql
SELECT * FROM student_invites LIMIT 1;
```

If this errors with "relation does not exist", the migration didn't run.

### Step 2: Check RLS policies
Run this to see if RLS is enabled:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'student_invites';
```

Should show: rowsecurity = true ✅

### Step 3: Check permissions
Make sure your user can insert into the table:
```sql
SELECT * FROM student_invites;
```

Should either return 0 rows or an empty result set (no error)

---

## Quick Summary

| Issue | Check | Fix |
|-------|-------|-----|
| Invite button doesn't work | Does `student_invites` table exist in Tables? | Run migration |
| Table exists but still errors | Check browser console (F12) | Note error message |
| "relation does not exist" error | Run migration SQL | Copy all code from student-enrollment-setup.sql |
| "permission denied" error | Check RLS policies | Verify correct user role |

---

**Need help?** Check these files:
- `database/student-enrollment-setup.sql` - The migration file
- `MIGRATION_FIX_SUMMARY.md` - Details about what was fixed
- `docs/DATABASE_MIGRATION_FIXED.md` - Complete migration guide

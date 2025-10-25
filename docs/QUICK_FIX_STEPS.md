# Quick Fix Steps - Document Upload & Related Errors

## 3 Errors You're Getting

1. **403 Forbidden on churches table** - Churches table has restrictive RLS
2. **StorageApiError: Bucket not found** - documents & trip-photos buckets don't exist
3. **payment_summaries.church_id column missing** - View doesn't have church_id

## 2-Minute Fix

### Step 1: Copy the Fix Script
Open: `/Users/sethegger/Mission-Trip-Platform/SIMPLE_FIX.sql`

This file has the corrected SQL (fixes the payment_summaries error from COMPLETE_FIX.sql)

### Step 2: Run in Supabase
1. Go to https://app.supabase.com → Your Project
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Copy entire contents of SIMPLE_FIX.sql
5. Paste into SQL editor
6. Click **Run** (or Ctrl+Enter)

Expected: "Query executed successfully" (no errors)

### Step 3: Verify Changes
Run these verification queries in SQL Editor:

```sql
-- Check 1: Churches RLS disabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'churches';
```
Expected: `rowsecurity = false` ✓

```sql
-- Check 2: Storage buckets created
SELECT id, name, public
FROM storage.buckets
WHERE id IN ('documents', 'trip-photos');
```
Expected: 2 rows ✓

```sql
-- Check 3: Payment summaries has church_id
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'payment_summaries'
ORDER BY ordinal_position;
```
Expected: includes `church_id` column ✓

### Step 4: Restart and Test
1. Hard refresh browser: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
2. Go to parent-portal.html
3. Try uploading document again
4. Should work now! ✅

---

## What The Fix Does

### Disables RLS on Churches Table
- Churches table is meant to be public (list of all churches)
- Old RLS only allowed seeing your own church (broke landing page)
- Now everyone can see all churches, but data tables (students, events, etc.) still have RLS for isolation

### Creates Storage Buckets
- `documents` bucket - for file uploads
- `trip-photos` bucket - for trip memories with photos
- Adds permissions for authenticated users to upload/delete

### Fixes payment_summaries
- Recreates as a proper SQL VIEW
- Includes church_id so filtering by church works
- Joins students + payments + churches to provide summary

### Maintains Security
- Data is still isolated by church_id at database level
- RLS policies still enforce tenant isolation on sensitive tables
- Storage policies restrict who can access files

---

## If Fix Doesn't Work

### "Still getting 403 on churches"
Run this to verify:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'churches';
```

If `rowsecurity = true`, the fix didn't apply. Try:
```sql
ALTER TABLE churches DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON churches TO authenticated;
GRANT SELECT ON churches TO anon;
```

### "Still getting StorageApiError: Bucket not found"
Verify buckets exist:
```sql
SELECT id, name FROM storage.buckets;
```

If documents & trip-photos don't appear, create manually:
1. Click "Storage" in Supabase sidebar
2. Click "Create New Bucket"
3. Name: `documents`, uncheck "Private", click "Create"
4. Repeat for `trip-photos`

### "Still getting payment_summaries error"
Run this:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'payment_summaries';
```

Should include: `church_id, student_id, student_name, church_name, total_paid, balance_due`

If missing, the view recreation didn't work. Check for errors in the SQL run output.

---

## Why These Issues Happened

### Churches RLS Too Restrictive
The migration script created RLS policies meant for data isolation, but applied them to the wrong table. Churches table should be public for discovery.

### Storage Buckets Not Created
The migration only created database schema, not Supabase Storage buckets (which are a separate system).

### payment_summaries Missing church_id
The original view definition didn't include church_id. The fix recreates it as a proper multi-tenant view.

---

## After Fix Applied

✅ Landing page works (lists all churches)
✅ Church context detection works (no 403 errors)
✅ Document uploads work (buckets exist)
✅ Payment info loads (payment_summaries has church_id)
✅ Data still isolated by church (RLS policies on other tables)
✅ Admin role enforcement still works

---

## Next Step: Test Everything

Follow the **TRINITY_SETUP_AND_TESTING.md** checklist to verify:
1. Signup as parent
2. Upload documents
3. Add students
4. View payments
5. Submit questions
6. Admin approval workflow

All should work now!

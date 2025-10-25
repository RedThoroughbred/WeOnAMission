# Fixing Errors - Document Upload & Churches Table

## Issues Found

You've discovered 3 interconnected issues:

### Issue 1: 403 Forbidden on Churches Table
**Error:** `GET https://.../rest/v1/churches?select=id&slug=eq.trinity 403 (Forbidden)`

**Cause:** The migration script created RLS policies on the churches table that are too restrictive. They only allow viewing churches that match your `church_id`, but you need to see ALL churches:
- Landing page needs to list all churches
- tenant.js needs to fetch church info to detect context
- Users signup at any church, not just their own

**Fix:** Disable RLS on churches table (it's meant to be public)

### Issue 2: Storage Buckets Not Created
**Error:** `StorageApiError: Bucket not found`

**Cause:** The code references `documents` and `trip-photos` storage buckets, but they were never created in Supabase Storage.

**Fix:** Create the buckets and set proper permissions

### Issue 3: payment_summaries Missing church_id
**Error:** `column payment_summaries.church_id does not exist`

**Cause:** payment_summaries might be a view or materialized view that doesn't have church_id column. The migration script may not have updated it.

**Fix:** Verify table structure and add column if needed

---

## Step-by-Step Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy the entire contents of `fix-issues.sql`

### Step 2: Run the Fix Script

Paste this SQL in the editor:

```sql
-- FIX 1: Disable RLS on churches table
ALTER TABLE churches DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON churches TO authenticated;
GRANT SELECT ON churches TO anon;

-- FIX 3: Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Grant storage permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
```

Click **Run** button (or Ctrl+Enter)

Expected output: No errors, just "executed successfully"

### Step 3: Verify Storage Buckets Were Created

1. In Supabase, go to **Storage** in left sidebar
2. You should see two buckets:
   - `documents`
   - `trip-photos`
3. If they exist, click each one and verify they show as "Public"

### Step 4: Check payment_summaries Table

The payment_summaries error suggests it may not have church_id. Let's verify:

Run this query in SQL Editor:

```sql
-- Check if payment_summaries exists and what columns it has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payment_summaries'
ORDER BY ordinal_position;
```

Expected output: List of columns including `church_id`

If `church_id` is missing, that's a problem. Let me know and we'll fix it.

### Step 5: Clear Browser Cache and Test

1. Close browser or hard refresh (Ctrl+Shift+R)
2. Go to parent-portal.html
3. Try uploading a document again
4. It should work now!

---

## Understanding the Issues

### Why Churches Table Had Restrictive RLS

The migration script was trying to be secure by adding RLS policies like:

```sql
CREATE POLICY "Users can view their church"
ON churches FOR SELECT
USING (id = (SELECT church_id FROM users WHERE id = auth.uid()));
```

This means "you can only see the church you belong to". But this breaks:
- **Landing page** - needs to list ALL churches
- **Church detection** - needs to fetch church info for unknown churches
- **Signup flow** - users accessing a church URL shouldn't need to be a user of that church yet

**Solution:** Disable RLS on churches table. It's meant to be public - listing available churches isn't sensitive data. The sensitive part (data isolation) is enforced on OTHER tables (students, events, questions, etc.) via their church_id column.

### Why Storage Buckets Didn't Exist

The migration script created the DATABASE schema but didn't create the Supabase Storage buckets. Storage buckets are a separate system from the database.

We reference them in api.js:
```javascript
const { error } = await supabaseClient.storage
    .from('documents')  // ← This bucket needs to exist!
    .upload(filePath, file);
```

But we never created the `documents` and `trip-photos` buckets.

### Why payment_summaries Has No church_id

The payment_summaries table might be:
1. A VIEW (read-only, calculated on the fly)
2. A table that wasn't in the migration script
3. A table that doesn't need church_id if it's per-student and students already have church_id

We filter by it in the API:
```javascript
.eq('church_id', churchId)
```

But it may not have that column. If it's a view, we might need to change the query instead.

---

## After Fixes Are Applied

### You'll be able to:

✅ Upload documents - documents bucket exists
✅ Visit landing page - churches table is readable
✅ Load church context - can fetch church info
✅ See payment info - once payment_summaries is verified/fixed

### Expected Behavior:

1. **Landing page** shows all churches
2. **Church context detection** works (no 403 errors)
3. **Document upload** succeeds
4. **Payment info** loads in parent portal

---

## If You Still Get Errors

### "403 Forbidden on churches" still appears:

Run this query to verify RLS is disabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'churches';
```

Expected: `rowsecurity = false` means RLS is disabled ✓

If it shows `true`, the ALTER command didn't work. Try again.

### "Bucket not found" still appears:

Verify buckets exist:

```sql
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('documents', 'trip-photos');
```

Expected: 2 rows (both buckets)

If you get 0 rows, the INSERT didn't work. Try creating manually:

1. Go to Storage in Supabase
2. Click "Create New Bucket"
3. Name: `documents`, uncheck "Private"
4. Create
5. Repeat for `trip-photos`

### "column payment_summaries.church_id does not exist"

Run the check query above. If church_id is missing, we have two options:

**Option A:** Add the column
```sql
ALTER TABLE payment_summaries
ADD COLUMN church_id UUID REFERENCES churches(id);
```

**Option B:** Fix the API query to not filter by church_id
```javascript
// In api.js, getAllPaymentSummaries()
// Remove: .eq('church_id', churchId)
// Instead filter by user's students which have church_id
```

Let me know if you still see this error and I can fix it.

---

## Summary

The fixes address:

1. **Churches RLS** - Disabled so landing page can list all churches
2. **Storage buckets** - Created documents and trip-photos for uploads
3. **Permissions** - Granted storage access to authenticated users
4. **payment_summaries** - Need to verify structure (may need additional fix)

Run the fix script, verify the changes, and test uploading a document again!

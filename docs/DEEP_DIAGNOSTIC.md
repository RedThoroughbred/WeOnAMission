# Deep Diagnostic - Permission Error Persists

The permission error is continuing even after disabling RLS. This means the problem isn't RLS - it's something more fundamental. Let's diagnose what's really happening.

## Run These Diagnostic Queries

Go to **Supabase → SQL Editor** and run each of these separately.

### Query 1: Check Table Structure

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'student_invites'
ORDER BY ordinal_position;
```

**Expected to see:** About 10 columns (id, student_id, parent_id, church_id, invite_token, student_email, status, created_at, expires_at, accepted_at)

**If you see:** Different columns or fewer columns, the table structure is wrong

### Query 2: Check RLS Status

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'student_invites';
```

**Expected:** `rowsecurity = false` (since we disabled it)

**If you see:** `rowsecurity = true`, RLS is still enabled somehow

### Query 3: Try a Simple SELECT

```sql
SELECT COUNT(*) FROM student_invites;
```

**Expected:** A number (0 or more)

**If you get error:** The exact error message will tell us what's wrong

### Query 4: Check Table Permissions

```sql
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'student_invites';
```

**Expected:** See grants for your user/role

**If empty:** Table has no permissions configured

### Query 5: Check Policies (even though RLS disabled)

```sql
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'student_invites';
```

**Expected:** Either empty or policies listed

### Query 6: Check Table Owner

```sql
SELECT tableowner, tablename
FROM pg_tables
WHERE tablename = 'student_invites' AND schemaname = 'public';
```

**Expected:** Shows the owner of the table

---

## What Each Result Tells Us

| Result | Interpretation |
|--------|-----------------|
| **Query 1 shows missing columns** | Table wasn't created with correct schema |
| **Query 2 shows rowsecurity = true** | RLS disable didn't work, try again |
| **Query 3 gives error** | Table is corrupted or inaccessible |
| **Query 4 shows no rows** | Table has no permissions |
| **Query 5 shows policies** | Policies still exist even though RLS disabled |
| **Query 6 shows different owner** | Permissions issue - table owned by wrong user |

---

## Most Likely Issue

The error `permission denied` with code 42501 usually means:

1. **RLS is still enabled** and blocking access
2. **The Supabase anon key doesn't have permissions** on the table
3. **The table was created by a different user** and isn't accessible

---

## If Queries Show Problem

### Problem: Table Structure Wrong

**Solution:** Drop and recreate the table

```sql
DROP TABLE IF EXISTS student_invites CASCADE;

CREATE TABLE student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;
```

### Problem: RLS Still Enabled

Try again:

```sql
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT rowsecurity FROM pg_tables WHERE tablename = 'student_invites';
```

If it still shows `true`, there might be a Supabase issue.

### Problem: No Permissions

Grant permissions:

```sql
GRANT ALL ON student_invites TO anon, authenticated, service_role;
```

---

## Next Steps

1. **Run Query 1-6 above** in order
2. **Note the results**
3. **Based on results, apply the matching solution**
4. **Try the invite button again**

---

## If Still Stuck

You now have diagnostic information:
- Table structure ✓
- RLS status ✓
- Permissions ✓
- Policies ✓
- Owner ✓

With this info, we can pinpoint the exact issue.

---

**File:** Use this guide to run diagnostics and find the root cause.

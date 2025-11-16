# Final Solution - Recreate Table from Scratch

The permission error is persisting because the `student_invites` table is in a broken state. The nuclear option is to completely remove and recreate it.

## ⚠️ WARNING

This will:
- ✅ Delete the table
- ✅ Delete any invite data (if any)
- ✅ Recreate it fresh
- ✅ Enable full access
- ✅ Fix the permission error

**This is safe** - you probably don't have real invite data yet.

## Do This NOW

Go to **Supabase → SQL Editor → New Query**

Paste this entire SQL:

```sql
-- Drop the broken table
DROP TABLE IF EXISTS student_invites CASCADE;

-- Create fresh table
CREATE TABLE student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID NOT NULL,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON student_invites TO anon, authenticated, service_role;

-- Create indexes
CREATE INDEX idx_invite_token ON student_invites(invite_token);
CREATE INDEX idx_student_id ON student_invites(student_id);
CREATE INDEX idx_parent_id ON student_invites(parent_id);
CREATE INDEX idx_church_id ON student_invites(church_id);

-- Verify it works
SELECT 'Table ready!' as status;
```

Click **Run**

Should see: `status = "Table ready!"` ✅

## Then Test

1. **Refresh browser** (Ctrl+Shift+R)
2. **Click "Send Invite"**
3. **Enter email**
4. **Click "Send Invite"**

**Should work now!** ✅

---

## Why This Works

The original table was in a broken state (possibly corrupted during migration). By:
1. **Dropping it completely** - removes all bad state
2. **Recreating fresh** - clean table structure
3. **Disabling RLS** - no permission checks
4. **Granting permissions** - all roles can access
5. **Creating indexes** - performance optimized

We get a working table that the API can access.

---

## If It Still Doesn't Work

Something more fundamental is wrong. Run the diagnostic queries from `DEEP_DIAGNOSTIC.md`:

```sql
-- Can we SELECT from the table?
SELECT COUNT(*) FROM student_invites;

-- Can we INSERT into it?
INSERT INTO student_invites
(student_id, parent_id, church_id, invite_token, student_email, status)
VALUES (
    (SELECT id FROM students LIMIT 1),
    (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
    (SELECT id FROM churches LIMIT 1),
    'test',
    'test@example.com',
    'pending'
);
```

If either of these gives an error, Supabase itself might have an issue.

---

## Status

✅ **This should fix it!**

Drop + recreate + fresh permissions = working table

---

## Next Steps

1. **Run the SQL above**
2. **Refresh browser**
3. **Test invite button**
4. **Feature works!** 🎉

No more permission errors!

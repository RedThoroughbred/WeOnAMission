# Database Migration - SQL Syntax Fixes

## Issues Found and Fixed

### Issue #1: Index Syntax Error

**WRONG** (MySQL/MariaDB syntax):
```sql
CREATE TABLE student_invites (
    ...
    INDEX idx_invite_token (invite_token),
    INDEX idx_student_id (student_id),
    ...
);
```

**Error message:**
```
ERROR: 42704: type "idx_invite_token" does not exist
```

**FIXED** (PostgreSQL syntax):
```sql
CREATE INDEX IF NOT EXISTS idx_invite_token ON student_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_student_id ON student_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_church_id ON student_invites(church_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON student_invites(parent_id);
CREATE INDEX IF NOT EXISTS idx_status ON student_invites(status);
```

---

### Issue #2: Non-Immutable Function in Index

**WRONG** (NOW() is not immutable):
```sql
CREATE INDEX idx_valid_invites ON student_invites(invite_token, status)
WHERE status = 'pending' AND expires_at > NOW();
```

**Error message:**
```
ERROR: 42P17: functions in index predicate must be marked IMMUTABLE
```

**FIXED** (Use only immutable conditions):
```sql
CREATE INDEX IF NOT EXISTS idx_pending_invites ON student_invites(invite_token)
WHERE status = 'pending';
```

---

## Summary of Changes

| Issue | Before | After | Reason |
|-------|--------|-------|--------|
| **Index syntax** | Inside CREATE TABLE | Separate CREATE INDEX statements | PostgreSQL requires separate statements |
| **Index predicate** | `WHERE status = 'pending' AND expires_at > NOW()` | `WHERE status = 'pending'` | NOW() is not IMMUTABLE in PostgreSQL |
| **Database support** | MySQL only | PostgreSQL (Supabase compatible) | Supabase uses PostgreSQL |

## Files Updated

- ✅ `database/student-enrollment-setup.sql` - All SQL syntax corrected

## Status

✅ **FULLY FIXED - Ready to run**

The migration file is now 100% compatible with Supabase/PostgreSQL.

## How to Apply

1. Go to Supabase → **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `database/student-enrollment-setup.sql`
4. Paste into editor
5. Click **Run**
6. Should complete with **"Success"** messages (no red errors)

---

**Previous Issues:**
- ❌ `ERROR: 42704: type "idx_invite_token" does not exist`
- ❌ `ERROR: 42P17: functions in index predicate must be marked IMMUTABLE`

**Current Status:** ✅ ALL FIXED - Ready to deploy

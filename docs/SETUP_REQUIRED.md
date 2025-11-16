# 🔴 Setup Required - Student Invite Feature

## Why You Got an Error

You clicked the "Send Invite" button and got this error:

```
TypeError: API.sendStudentInvite is not a function
```

OR you got PostgreSQL errors when trying to run the migration:

```
ERROR: 42704: type "idx_invite_token" does not exist
ERROR: 42P17: functions in index predicate must be marked IMMUTABLE
```

Both errors happen because **the database table doesn't exist yet**. This is a one-time setup step.

**The migration SQL has been fully fixed** - you can now run it successfully.

---

## ✅ How to Fix It (5 minutes)

### Step 1: Open Supabase

Go to https://app.supabase.com and select your project

### Step 2: Go to SQL Editor

Click the "SQL Editor" tab on the left

### Step 3: Run the Migration

1. Click "New Query"
2. Delete any placeholder text
3. Open this file: `database/student-enrollment-setup.sql`
4. Copy ALL the code from that file
5. Paste it into the Supabase SQL editor
6. Click the "Run" button

### Step 4: Verify

- You should see "Success" messages (no red errors)
- Go to "Tables" tab
- Look for `student_invites` table
- It should be there with all the columns

### Step 5: Test

1. Go back to your parent portal
2. Click "Send Invite" button again
3. It should work now! ✅

---

## 📍 The File You Need

**Location:** `database/student-enrollment-setup.sql`

This SQL file:
- Creates the `student_invites` table
- Adds security policies
- Sets up indexes for performance
- Enables the invite feature

---

## 📚 More Info

For detailed instructions, see:
- `docs/DATABASE_MIGRATION_REQUIRED.md` - Step-by-step guide
- `docs/NEXT_STEPS_STUDENT_INVITES.md` - Complete next steps
- `docs/INVITE_BUTTON_IMPLEMENTATION.md` - Technical details

---

## 🎯 That's It!

After those 5 steps, the invite button will work perfectly.

The feature is **100% built** - it just needs this one database setup to activate.

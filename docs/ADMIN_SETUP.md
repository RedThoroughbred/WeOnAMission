# Admin Account Setup

## Problem

You're getting "You do not have permission to access this page" when trying to access the super-admin portal.

**Reason**: Your user account doesn't have `role = 'admin'`

---

## Solution: Update Your User Role

### Method 1: Supabase SQL Console (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Click "New query"

3. **Run this SQL**
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your@email.com';
   ```

   Replace `'your@email.com'` with your actual email address

4. **Execute** (Ctrl+Enter or click ▶ button)

5. **Verify**
   ```sql
   SELECT email, role, church_id FROM users WHERE email = 'your@email.com';
   ```

6. **Hard refresh** your browser (`Ctrl+Shift+R`)

7. **Try accessing super-admin portal again**

---

## Method 2: Direct Database View (Alternative)

If you prefer using the Table Editor:

1. **Go to Supabase** → Your project
2. **Left sidebar** → "Tables"
3. **Click "users" table**
4. **Find your row** (search by email)
5. **Click the row** to open it
6. **Change "role" field** from `"parent"` or `"student"` → `"admin"`
7. **Click Save**
8. **Hard refresh browser**

---

## Finding Your Email

If you forgot which email you used:

1. **Go to Supabase** → Your project
2. **Left sidebar** → "Authentication"
3. **Users tab** → Look for your user
4. Your email is in the list

---

## What Happens After

Once your role is set to 'admin':

- ✅ Super-admin portal will open
- ✅ You'll see churches list
- ✅ You'll see users list
- ✅ You can create/edit churches
- ✅ You can manage users
- ✅ You can see statistics

---

## Admin Portal Sections

Once you have access, the super-admin portal has:

1. **Statistics Dashboard**
   - Total churches
   - Total users
   - Invite metrics

2. **Churches Management**
   - List all churches
   - Create new church
   - Edit church details
   - Manage church users

3. **Users Management**
   - View all users
   - Assign roles (parent, student, admin)
   - View user churches

---

## Important Notes

- **Admin role** = Full access to super-admin portal
- **Parent role** = Access to parent portal
- **Student role** = Access to student portal
- These roles are checked on page load

---

## Troubleshooting

### Still says "No permission" after update?

1. **Clear cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or open in private window

2. **Verify role was saved**
   ```sql
   SELECT email, role FROM users WHERE email = 'your@email.com';
   ```

3. **Check auth cache**
   - Open DevTools (F12)
   - Go to Console tab
   - Run: `await API.getCurrentUser()`
   - Should show `role: "admin"`

### Super-admin portal shows empty tables?

1. **Verify churches exist**
   ```sql
   SELECT id, name, slug FROM churches;
   ```

2. **Check RLS policies** - May need to adjust permissions for admin

3. **Verify users in users table**
   ```sql
   SELECT id, email, role FROM users;
   ```

---

## Next Steps

After setting up admin:

1. Create any additional churches you need
2. Manage user roles as needed
3. Return to building parent/student features

---

**Date**: 2025-10-25
**Status**: Follow Method 1 or 2 above to set up admin access

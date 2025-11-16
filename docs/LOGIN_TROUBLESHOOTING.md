# Login Troubleshooting Guide

## Problem: "Invalid login credentials"

You're getting this error when trying to sign in with your parent account:
```
AuthApiError: Invalid login credentials
```

This means one of three things:
1. Wrong email address
2. Wrong password
3. Account doesn't exist yet

---

## Solution: Reset Your Parent Account

### Option 1: Quick Reset (Recommended)

**In Supabase Console:**

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Users**
4. Find your parent user (search by email)
5. Click the "..." menu → **Delete User**
6. Go back to app and click "Sign Up"
7. Create account with same email and new password
8. You'll now have a working parent account

### Option 2: Reset Password

1. Go to login page
2. Click "Forgot Password" (if available)
3. Follow email link to reset password
4. Try signing in again

**NOTE**: Supabase sends password reset emails - check your email!

### Option 3: Check If Account Exists

**In Supabase Console:**

1. Go to **Authentication** → **Users**
2. Search for your email
3. If you see it:
   - ✓ Account exists - password issue
   - Try resetting password
4. If you don't see it:
   - ✗ Account doesn't exist yet
   - You need to sign up first

---

## Why This Happened

The app detected you were on a "church-specific page" (`/trinity/...`) and tried to redirect to `/trinity/parent-portal.html`, but files are at root level, not in a `/trinity/` subdirectory.

**This has been fixed** in login.html - now it simply redirects based on your role.

---

## What to Do Now

### Step 1: Hard Refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Step 2: Try Signing In
1. Go to login page
2. Try your email and password
3. If it works → you're good!
4. If "Invalid credentials" → follow "Option 1" below

### Step 3: Reset Account (if needed)

**Follow Option 1 above** to delete and recreate your account.

---

## Account Status Check

**Check which accounts exist in Supabase:**

1. Go to https://app.supabase.com
2. Select your project
3. Click **Authentication** → **Users**
4. You'll see all your accounts

You should have:
- ✓ Your parent email (role = 'parent')
- ✓ At least one student email (role = 'student')

---

## After Login

Once you successfully log in:

1. **Parent** → Goes to parent-portal.html
2. **Student** → Goes to student-portal.html
3. **Admin** (if role set) → Goes to admin-portal.html

---

## Common Issues

### "Password reset email not received"
- Check spam folder
- Supabase emails can take a few minutes
- Make sure you used correct email

### "Account deleted but can't sign up again"
- Sometimes takes a few seconds to propagate
- Wait 30 seconds and try again
- Hard refresh browser

### "Signed in but went to student portal instead of parent"
- Check your user role in Supabase
- Go to **Authentication** → **Users**
- Click your user and check the `role` field in metadata
- Should be 'parent' for parent accounts

### "Can't sign up - says email already in use"
- Account already exists
- Either reset password or delete account first
- See Option 1 above

---

## Prevention

To avoid this in the future:

1. **Remember your credentials**
   - Write down email and password somewhere safe
   - Or use browser password manager

2. **Don't delete auth users accidentally**
   - Only delete if you want to reset

3. **Check role is set correctly**
   - Parent accounts should have role = 'parent'
   - Student accounts should have role = 'student'

---

## If Still Stuck

**Check these files for more info:**
- api.js (signIn function)
- auth.js (redirectToPortal function)
- login.html (sign in handler)

**Or look at console errors:**
- F12 → Console tab
- Look for error messages
- Take a screenshot

---

## Quick Checklist

- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Tried signing in again
- [ ] Checked email in Supabase users list
- [ ] Verified account role is 'parent'
- [ ] Reset password if needed
- [ ] Recreated account if needed
- [ ] Can now sign in successfully

---

**Date**: 2025-10-25
**Fixed**: Login redirect URL issue
**Status**: Ready to test

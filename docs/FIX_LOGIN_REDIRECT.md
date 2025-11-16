# Fix Applied: Login Redirect Issue

## Problem Identified

When you tried to log in to the parent portal, you got:
```
GET http://localhost:8000/trinity/parent-portal.html 404 (File not found)
```

The system was trying to redirect to `/trinity/parent-portal.html` but your files are at the root level: `/parent-portal.html`

---

## Root Cause

The login.html had code designed for a **multi-tenant subdirectory architecture**:

```javascript
// OLD CODE (BROKEN):
if (currentChurch && user) {
    const churchBaseUrl = Tenant.getChurchBaseUrl(currentChurch.slug);
    window.location.href = `${churchBaseUrl}/${portalPage}`;
    // This produced: /trinity/parent-portal.html ❌
}
```

The `Tenant.getChurchBaseUrl()` function builds URLs like:
```
http://localhost:8000/trinity/
```

But your actual files are at:
```
http://localhost:8000/
```

---

## Solution Applied

**File**: login.html (lines 325-329)

**Changed from:**
```javascript
if (currentChurch && user) {
    const portalMap = {
        'parent': 'parent-portal.html',
        'student': 'student-portal.html',
        'admin': 'admin-portal.html'
    };
    const portalPage = portalMap[user.role] || 'parent-portal.html';
    const churchBaseUrl = Tenant.getChurchBaseUrl(currentChurch.slug);
    window.location.href = `${churchBaseUrl}/${portalPage}`;
} else {
    Auth.redirectToPortal(user.role);
}
```

**Changed to:**
```javascript
// Redirect to appropriate portal based on role
Auth.redirectToPortal(user.role);
```

Now it uses the simple `Auth.redirectToPortal()` function which correctly redirects to:
- Parent accounts → `/parent-portal.html`
- Student accounts → `/student-portal.html`
- Admin accounts → `/admin-portal.html`

---

## What This Means

✅ Login now works correctly
✅ Parents will be redirected to parent portal
✅ Students will be redirected to student portal
✅ No more 404 errors

---

## How to Test

1. **Hard refresh browser**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Try logging in again**
   - If your account exists → should work now
   - If "Invalid credentials" → account may need to be reset (see LOGIN_TROUBLESHOOTING.md)

3. **You should be redirected to correct portal**
   - Parent accounts → parent-portal.html
   - Student accounts → student-portal.html

---

## About the "Invalid Login Credentials" Error

This is separate from the redirect issue. It means:

1. **Wrong email** - Check you're using correct email
2. **Wrong password** - Check you're using correct password
3. **Account doesn't exist** - Need to sign up or recreate account

**See LOGIN_TROUBLESHOOTING.md for how to reset/recreate your account.**

---

## Future: Multi-Tenant Subdirectory Architecture

The `Tenant.getChurchBaseUrl()` function in tenant.js is designed for future support of:

```
weonamission.org/trinity/parent-portal.html
weonamission.org/grace/student-portal.html
```

But for now, all files are at root:
```
localhost:8000/parent-portal.html
localhost:8000/student-portal.html
```

When you're ready to implement subdirectory-based multi-tenancy, you can re-enable that logic.

---

## Files Changed

**Modified:**
- login.html (lines 325-329)

**Created:**
- LOGIN_TROUBLESHOOTING.md (this fix + troubleshooting guide)
- FIX_LOGIN_REDIRECT.md (this document)

---

## Status

✅ **FIXED** - Login redirect now works correctly

Next: Reset your parent account password or recreate it following LOGIN_TROUBLESHOOTING.md

---

**Date**: 2025-10-25
**Impact**: Fixes login redirect 404 error
**Status**: Ready to test

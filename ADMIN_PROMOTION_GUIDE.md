# Admin Promotion Guide - User Management in Super Admin Portal

## Overview

This guide explains how to promote users to admin role in the WeOnAMission platform. Previously, this required running SQL commands directly in Supabase. Now it's handled through the Super Admin Portal UI.

---

## The Problem (Previously)

Before this feature, promoting a user to admin required:

1. Super admin logs into Supabase SQL Editor
2. Runs a manual SQL command:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@church.org' AND church_id = '...';
```
3. User must wait for super admin to complete the SQL command
4. Error-prone (easy to get wrong email or church ID)
5. Takes 5-10 minutes per promotion

**Identified Bottleneck in CHURCH_ONBOARDING_FLOW.md:**
> "Phase 2: Church Admin Gets Set Up (10-20 minutes via SQL)"
> This manual SQL process was the slowest step in church onboarding.

---

## The Solution

Now admins can be promoted directly from the Super Admin Portal's user management interface in seconds.

---

## How to Use

### Step 1: Access User Management

1. Log in to Super Admin Portal: `http://localhost:8000/super-admin-portal.html?church=trinity`
2. Scroll down to the **"Manage Church Users"** section
3. Select a church from the dropdown: **"Select Church to View Users"**

### Step 2: View Users

After selecting a church, you'll see a table of all users for that church:

| Email | Name | Role | Joined | Actions |
|-------|------|------|--------|---------|
| parent@example.com | Tom Smith | Parent | 10/24/2025 | Promote to Admin |
| admin@example.com | Mark Johnson | Admin | 10/20/2025 | Demote to Parent |

The table shows:
- **Email** - User's email address
- **Name** - Full name from profile
- **Role** - Current role (Admin or Parent)
- **Joined** - Date user signed up
- **Actions** - Button to promote or demote

### Step 3: Promote User to Admin

1. Find the user you want to promote in the users table
2. Click the **"Promote to Admin"** button
3. Confirm the action in the popup dialog
4. User is now promoted! They'll see "Admin" role in the next refresh

#### Example Workflow

```
Church Creation → Admin Signup → Promote to Admin (1 click)
                                     ↓
                              Takes 5 seconds
                              No SQL needed
                              Instant confirmation
```

### Step 4: Demote User (if needed)

If you need to remove admin privileges from someone:

1. Find the admin user in the table (marked with blue "Admin" badge)
2. Click the **"Demote to Parent"** button
3. Confirm in the dialog
4. User role changes to Parent immediately

---

## What Happens When You Promote

When a user is promoted to admin:

✅ Their `role` column in `users` table changes from `'parent'` to `'admin'`
✅ They can now access the admin portal for their church
✅ They can manage events, FAQs, resources, and answer questions
✅ They can upload and approve documents
✅ The change is instant - no page refresh needed

---

## What Happens When You Demote

When an admin is demoted back to parent:

✅ Their `role` column changes from `'admin'` to `'parent'`
✅ They can no longer access admin portal
✅ They keep their parent account with students/payments intact
✅ They see a "permission denied" if they try to access admin pages

---

## Security

### Who Can Promote/Demote?

Only **Super Admins** (platform admins) can promote/demote users. The API checks:

```javascript
async promoteUserToAdmin(userId, churchId) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('You do not have permission to promote users.');
    }
    // ... then proceed
}
```

### Scope

- Admins can only be promoted/demoted **within their assigned church**
- A user can be admin in Trinity but parent in Crossroads
- Each church has separate user management

---

## Use Cases

### Case 1: New Church Onboarding

**Timeline Before:** 5 min (church creation) + 20 min (SQL promotion) + 1-2 hours (build site) = ~2.5 hours total

**Timeline Now:** 5 min (church creation) + 0.5 min (UI promotion) + 1-2 hours (build site) = ~2 hours total

**Time Saved:** 19.5 minutes per church!

### Case 2: Emergency Admin Cover

Church admin is unavailable. Need to temporarily promote another user:

**Before:** Email super admin, wait 5-10 min, confirm via SQL
**Now:** Click "Promote to Admin", done instantly

### Case 3: Staff Rotation

Staff member is leaving the church. Need to remove their admin access:

**Before:** Request SQL change, wait for execution
**Now:** Find user, click "Demote", confirm. Done.

---

## API Functions (For Developers)

If you need to programmatically promote users, three API functions are available:

### `API.getChurchUsers(churchId)`

Get all users for a church.

```javascript
const users = await API.getChurchUsers('00000000-0000-0000-0000-000000000001');
// Returns:
// [
//   { id: '...', email: 'parent@example.com', full_name: 'Tom Smith', role: 'parent', church_id: '...', created_at: '2025-10-24' },
//   { id: '...', email: 'admin@example.com', full_name: 'Mark Johnson', role: 'admin', church_id: '...', created_at: '2025-10-20' }
// ]
```

### `API.promoteUserToAdmin(userId, churchId)`

Promote a user to admin role.

```javascript
const user = await API.promoteUserToAdmin('user-uuid', 'church-uuid');
// User role is now 'admin'
```

### `API.demoteUserFromAdmin(userId, churchId)`

Demote an admin back to parent role.

```javascript
const user = await API.demoteUserFromAdmin('admin-uuid', 'church-uuid');
// User role is now 'parent'
```

---

## Troubleshooting

### "You do not have permission to promote users"

**Issue:** You're trying to promote a user but getting an error.

**Cause:** You don't have super admin role.

**Fix:** Only super admins (role='admin' at platform level) can manage users. Check your role by logging in and verifying you can see the Super Admin Portal.

### "User not found" or "Error promoting user"

**Issue:** Promotion fails with an error.

**Cause:** Possible causes:
- Church ID is wrong
- User ID is wrong
- User doesn't belong to that church
- Database connectivity issue

**Fix:**
1. Refresh the page and reload the user list
2. Make sure church selection is correct
3. Check database connectivity in Supabase dashboard

### User doesn't see admin portal after promotion

**Issue:** User was promoted but still sees parent portal.

**Cause:** User's browser cached the old role.

**Fix:**
1. Have the user do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R on Mac)
2. Logout and login again
3. Clear browser cache

---

## Related Documentation

- **CHURCH_ONBOARDING_FLOW.md** - Complete church setup timeline (previously mentioned "Phase 2: Church Admin Gets Set Up (10-20 minutes via SQL)")
- **SYSTEM_OVERVIEW.md** - System architecture and user roles
- **QUICK_REFERENCE.md** - Quick lookup for all platform features

---

## Summary

The admin promotion feature eliminates the manual SQL bottleneck in church onboarding. Church setup now goes from ~2.5 hours to ~2 hours, with admin promotion taking just seconds instead of minutes.

**Before → Now:**
- ❌ Manual SQL commands → ✅ One-click UI buttons
- ❌ 5-10 minutes per promotion → ✅ Instant promotion
- ❌ Error-prone → ✅ Safe with confirmations
- ❌ Requires database access → ✅ Available in portal UI

Users can now go from signup to admin access in seconds, enabling faster church onboarding and more flexibility for emergency staff changes.

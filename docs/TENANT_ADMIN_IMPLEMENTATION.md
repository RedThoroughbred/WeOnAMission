# Tenant-Specific Admin Implementation Guide

## Status

✅ Architecture Designed
✅ Database Migration Created
✅ API Functions Implemented
🔧 UI to be Built (in progress)

---

## What Was Done

### 1. Architecture Designed
- See `TENANT_ADMIN_ARCHITECTURE.md` for complete details
- Admins can now be assigned to specific churches
- Multiple admins per church (unlimited)
- RLS policies updated for tenant isolation

### 2. Database Migration Ready
File: `database/tenant-admin-migration.sql`

**Changes:**
- Added `admin_churches` column to users table (UUID array)
- Created `GIN` index for performance
- Added 4 new PL/pgSQL functions
- Updated RLS policies
- Migrated existing admins to super-admin status

### 3. API Functions Added to `api.js`

**New Functions:**
```javascript
API.getCurrentAdmin()              // Get current user's admin info
API.canAdministerChurch(churchId)  // Check if can manage church
API.getAdminChurches()             // Get churches admin manages
API.addAdminToChurch(email, id)    // Add admin to church
API.removeAdminFromChurch(email, id) // Remove admin from church
API.getChurchAdmins(churchId)      // Get all admins for church
API.getAvailableAdmins(churchId)   // Get users that can be admins
```

---

## Implementation Steps

### Step 1: Run Database Migration ✅ READY

File: `database/tenant-admin-migration.sql`

Run in Supabase SQL Editor:
1. Open Supabase console
2. Go to SQL Editor
3. Create new query
4. Copy entire contents of `database/tenant-admin-migration.sql`
5. Execute
6. Verify success at bottom (shows admin count)

**What it does:**
- Adds `admin_churches` column
- Creates performance index
- Adds 4 helper functions
- Migrates existing admins to super-admin (can manage all churches)
- Sets up new RLS policies

### Step 2: Verify Migration ✅ READY

Check in Supabase:

```sql
-- See all admins and their assigned churches
SELECT email, role, admin_churches,
       array_length(admin_churches, 1) as church_count
FROM users
WHERE role = 'admin'
ORDER BY email;
```

Expected output:
```
email              | role  | admin_churches                           | church_count
------------------ |-------|------------------------------------------|-------------
your@email.com     | admin | {00000000-0000-0000-0000-000000000001} | 1
```

### Step 3: Update Super Admin Portal 🔧 IN PROGRESS

Create new section to manage admins:

**Location:** `super-admin-portal.html`

**Add new panel:**
```
Churches Management
├─ Trinity Church
│  ├─ Edit
│  ├─ Admins (NEW)
│  └─ Settings
├─ Grace Church
│  ├─ Edit
│  ├─ Admins (NEW)
│  └─ Settings
```

**Admins Panel UI:**
```
Church: Trinity
Manage Admins
──────────────

Current Admins:
┌──────────────────────────────────────┐
│ john@example.com                      │
│ Manages: Trinity, Grace               │
│ [Remove from Trinity] [Remove All]    │
├──────────────────────────────────────┤
│ sarah@example.com                     │
│ Manages: Trinity                      │
│ [Remove from Trinity]                 │
└──────────────────────────────────────┘

Add Admin:
Select user: [dropdown of available users]
[Add to Trinity]
```

### Step 4: Add JavaScript Event Handlers 🔧 TO DO

In `super-admin-portal.html`, add functions:

```javascript
// Load admins for a church
async function loadChurchAdmins(churchId) {
  const admins = await API.getChurchAdmins(churchId);
  // Display in table
}

// Add admin to church
async function addAdminToChurch(email, churchId) {
  const result = await API.addAdminToChurch(email, churchId);
  if (result.success) {
    Notify.success(result.message);
    await loadChurchAdmins(churchId);
  } else {
    Notify.error(result.message);
  }
}

// Remove admin from church
async function removeAdminFromChurch(email, churchId) {
  const result = await API.removeAdminFromChurch(email, churchId);
  if (result.success) {
    Notify.success(result.message);
    await loadChurchAdmins(churchId);
  } else {
    Notify.error(result.message);
  }
}

// Get available admins (for dropdown)
async function loadAvailableAdmins(churchId) {
  const available = await API.getAvailableAdmins(churchId);
  // Populate dropdown
}
```

### Step 5: Test Admin Access 🔧 TO DO

After UI is built, test:

```javascript
// Test 1: Super admin sees all churches
const admin = await API.getCurrentAdmin();
const churches = await API.getAdminChurches();
// Should show all churches

// Test 2: Church admin sees only their churches
// After assigning "john@example.com" to Trinity only:
// const churches = await API.getAdminChurches();
// Should show only Trinity

// Test 3: Can manage assigned church
const canManage = await API.canAdministerChurch(trinityId);
// Should return true

// Test 4: Cannot manage unassigned church
const cannotManage = await API.canAdministerChurch(graceId);
// Should return false
```

---

## API Reference

### getCurrentAdmin()
```javascript
const admin = await API.getCurrentAdmin();
// Returns:
{
  id: "user-uuid",
  email: "admin@example.com",
  role: "admin",
  admin_churches: ["church-uuid-1", "church-uuid-2"],
  is_super_admin: true
}
// Returns null if not admin
```

### getAdminChurches()
```javascript
const churches = await API.getAdminChurches();
// Returns:
[
  { id: "uuid", name: "Trinity Church", slug: "trinity" },
  { id: "uuid", name: "Grace Church", slug: "grace" }
]
// Returns [] if not admin
```

### canAdministerChurch(churchId)
```javascript
const canManage = await API.canAdministerChurch(churchId);
// Returns: true or false
```

### addAdminToChurch(email, churchId)
```javascript
const result = await API.addAdminToChurch("john@example.com", churchId);
// Returns:
{
  success: true,
  message: "Added john@example.com as admin for church ..."
}
// Or:
{
  success: false,
  message: "User must sign up first..."
}
```

### removeAdminFromChurch(email, churchId)
```javascript
const result = await API.removeAdminFromChurch("john@example.com", churchId);
// Returns:
{
  success: true,
  message: "Removed john@example.com as admin..."
}
```

### getChurchAdmins(churchId)
```javascript
const admins = await API.getChurchAdmins(churchId);
// Returns:
[
  {
    id: "uuid",
    email: "john@example.com",
    admin_churches: ["uuid1", "uuid2"]
  },
  {
    id: "uuid",
    email: "sarah@example.com",
    admin_churches: ["uuid1"]
  }
]
```

### getAvailableAdmins(churchId)
```javascript
const available = await API.getAvailableAdmins(churchId);
// Returns users not already admins for this church
[
  {
    id: "uuid",
    email: "newuser@example.com",
    role: "parent",
    admin_churches: []
  }
]
```

---

## Admin Management Workflow

### Create a New Admin

1. User signs up with email: `admin@example.com`
2. Super admin goes to super-admin-portal
3. Select church "Trinity"
4. Click "Manage Admins"
5. Select `admin@example.com` from dropdown
6. Click "Add to Trinity"
7. User now has:
   - `role = 'admin'`
   - `admin_churches = ['trinity-uuid']`

### Make Admin Manage Multiple Churches

1. Select church "Trinity"
2. Admin `john@example.com` is listed
3. Click "Add to Grace"
4. John now manages Trinity AND Grace
5. When John logs in, sees both churches

### Remove Admin from Church

1. Select church "Trinity"
2. Admin `john@example.com` is listed
3. Click "Remove from Trinity"
4. John now only manages Grace
5. Still has `role = 'admin'` for other churches

### Demote Admin to Parent

1. Select church "Trinity"
2. Admin `john@example.com` is listed
3. Remove from Trinity (only church)
4. When `admin_churches` becomes empty, automatically:
   - `role` changes to 'parent'
   - Gets assigned to Trinity as default church

---

## Data Flow

### Before: Global Admin
```
Admin logs in
  ↓
Check: role = 'admin'?
  ↓
YES → Can see ALL churches in dashboard
```

### After: Tenant-Specific Admin
```
Admin logs in
  ↓
Check: role = 'admin'? AND admin_churches populated?
  ↓
YES → Load only those churches in dashboard
  ↓
Show church selector with ONLY assigned churches
```

---

## Security

### RLS Policy Protection
```sql
-- Admin can only see their assigned churches
WHERE (
  role = 'admin'
  AND current_setting('app.church_id')::uuid = ANY(admin_churches)
)
```

### API-Level Checks
```javascript
// Before returning admin data
if (!(await API.canAdministerChurch(churchId))) {
  throw new Error('Unauthorized');
}
```

### Frontend Validation
```javascript
// Show only accessible churches
const churches = await API.getAdminChurches();
// Display only these churches
```

---

## Rollback (if needed)

If something goes wrong:

```sql
-- Remove admin_churches and revert to global admin
ALTER TABLE users DROP COLUMN admin_churches;
DROP FUNCTION can_admin_manage_church;
DROP FUNCTION get_admin_churches;
DROP FUNCTION add_admin_to_church;
DROP FUNCTION remove_admin_from_church;
DROP INDEX idx_users_admin_churches;
```

But this is reversible - all data is preserved.

---

## Migration Timeline

**Current Status**: Ready for super-admin portal UI update

**Next Steps**:
1. ✅ Database migration (ready to run)
2. 🔧 Super admin portal UI (in progress)
3. 🔧 Event handlers (to do)
4. 🔧 Testing (to do)
5. 📋 Then: Build donation feature

---

## FAQ

**Q: Can I have unlimited admins per church?**
A: Yes, this architecture supports unlimited admins per church.

**Q: Can one admin manage multiple churches?**
A: Yes, admin_churches is an array, so one admin can manage many churches.

**Q: What if an admin is removed from all churches?**
A: They're automatically demoted to 'parent' role and assigned to default church.

**Q: Can I prevent an admin from seeing other churches?**
A: Yes, RLS policies enforce that admins only see their assigned churches.

**Q: What about the donation feature?**
A: After this is complete, donation feature will use admin_churches to control per-church donation settings.

---

## Files Involved

**Database:**
- `database/tenant-admin-migration.sql` ✅ Ready

**JavaScript:**
- `api.js` ✅ Functions added
- `super-admin-portal.html` 🔧 UI to add

**Documentation:**
- `TENANT_ADMIN_ARCHITECTURE.md` ✅ Complete
- `TENANT_ADMIN_IMPLEMENTATION.md` ✅ This file

---

## Next Phase: Donation Feature

Once admin system is complete, donation feature will:
1. Use `admin_churches` to configure donations per church
2. Admins see only their church's donations
3. Super admins see all donations
4. Donations tracked with `church_id` for isolation

---

**Date**: 2025-10-25
**Status**: Architecture + API Complete, UI In Progress
**Estimated UI Time**: 1-2 hours

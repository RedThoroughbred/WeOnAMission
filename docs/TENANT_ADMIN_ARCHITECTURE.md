# Tenant-Specific Admin Architecture

## Overview

Currently, all admins can see and manage all churches. This document outlines the new architecture where admins are assigned to specific churches (tenants).

---

## Current State (Problems)

```
users table:
- role = 'admin' (global)     ← Can see ALL churches
- role = 'parent' (scoped)    ← Scoped by church_id
- role = 'student' (scoped)   ← Scoped by church_id

Issues:
❌ No way to have "Trinity admins" vs "Grace admins"
❌ All admins must trust each other (see all data)
❌ Can't restrict admin to specific churches
❌ No clear separation of admin responsibilities
```

---

## Desired State (New Architecture)

```
users table (updated):
- role = 'admin'              ← Global role
  admin_churches: [UUID, ...]  ← Specific churches they manage

- role = 'parent'
  church_id: UUID             ← Single church (unchanged)

- role = 'student'
  church_id: UUID             ← Single church (unchanged)

Benefits:
✅ Admins assigned to specific churches
✅ Multiple admins per church (unlimited)
✅ Admins only see their assigned churches
✅ Unlimited admins globally
✅ Clear admin responsibilities
```

---

## Database Changes

### Step 1: Add Column to users Table

```sql
-- Add admin_churches column to users table
ALTER TABLE users
ADD COLUMN admin_churches UUID[] DEFAULT ARRAY[]::UUID[];

-- This column stores an array of church IDs that admin can manage
-- Example: admin_churches = [
--   '00000000-0000-0000-0000-000000000001',  -- Trinity
--   '00000000-0000-0000-0000-000000000002'   -- Grace
-- ]
```

### Step 2: Create Index for Performance

```sql
-- Index for faster lookup of admin's churches
CREATE INDEX idx_admin_churches ON users USING GIN (admin_churches);
```

### Step 3: Update RLS Policies

Current RLS policies filter by `church_id`. Need to update to also check `admin_churches`:

```sql
-- For non-admin users (unchanged)
WHERE auth.uid() = users.id
  AND church_id = current_setting('app.church_id')

-- For admin users (new logic)
WHERE auth.uid() = users.id
  AND (
    role = 'admin'
    AND current_setting('app.church_id')::uuid = ANY(admin_churches)
  )
  OR role != 'admin'  -- Non-admins use church_id
```

---

## Application Logic

### Who Can Do What?

#### Super Admin (role = 'admin' with admin_churches = ALL churches)
```javascript
// Super admin actions
- View all churches
- Create new churches
- Create/edit admins
- Manage donation settings (all churches)
- View donations (all churches)
- View analytics (all churches)
```

#### Church Admin (role = 'admin' with admin_churches = [Trinity])
```javascript
// Church admin actions
- View only Trinity
- Manage Trinity settings
- Manage Trinity donations
- View Trinity donations
- View Trinity analytics
- Cannot create churches
- Cannot create other admins
```

#### Parent/Student
```javascript
// Regular user actions (unchanged)
- Access own church only
- View church data
- Manage own profile
```

---

## API Changes Required

### Function: getCurrentAdmin()
```javascript
async getCurrentAdmin() {
  const user = await this.getCurrentUser();

  if (user.role !== 'admin') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: 'admin',
    admin_churches: user.admin_churches,  // Array of UUIDs
    is_super_admin: admin_churches.includes(NULL)  // Or check length
  };
}
```

### Function: canAdministerChurch(churchId)
```javascript
async canAdministerChurch(churchId) {
  const admin = await this.getCurrentAdmin();

  if (!admin) return false;

  // Super admin can do anything
  if (admin.is_super_admin) return true;

  // Church admin can only do their churches
  return admin.admin_churches.includes(churchId);
}
```

### Function: getAdminChurches()
```javascript
async getAdminChurches() {
  const admin = await this.getCurrentAdmin();

  if (!admin) return [];

  // Get church details for all churches admin manages
  const { data: churches } = await supabaseClient
    .from('churches')
    .select('id, name, slug')
    .in('id', admin.admin_churches);

  return churches;
}
```

---

## Super Admin Portal Changes

### Current: Church List
```
All Churches
├─ Trinity Church
├─ Grace Church
└─ Faith Church
```

### New: Church List with Admin Management
```
All Churches
├─ Trinity Church
│  ├─ Admins: John (john@example.com), Sarah (sarah@example.com)
│  ├─ Settings
│  └─ Donations
├─ Grace Church
│  ├─ Admins: Mike (mike@example.com)
│  ├─ Settings
│  └─ Donations
└─ Faith Church
   ├─ Admins: (none assigned yet)
   ├─ Settings
   └─ Donations
```

### New: Admin Management Page
```
Church Admins
─────────────

Manage Admins for: Trinity Church

Current Admins:
┌─────────────────────────────────────┐
│ John Smith (john@example.com)        │
│ Churches: Trinity, Grace             │
│ [Edit] [Remove]                      │
├─────────────────────────────────────┤
│ Sarah Johnson (sarah@example.com)    │
│ Churches: Trinity                    │
│ [Edit] [Remove]                      │
└─────────────────────────────────────┘

Add Admin:
[Select user] [Add to Trinity] [Add]
```

---

## User Flows

### Flow 1: Create a Church Admin

```
Super Admin Portal
  ↓
Go to Churches → Trinity
  ↓
Click "Manage Admins"
  ↓
Click "Add Admin"
  ↓
Select from existing users or create new
  ↓
Check "Trinity" checkbox
  ↓
Click "Save"
  ↓
User now has role='admin' with admin_churches=[Trinity UUID]
```

### Flow 2: Admin Views Dashboard

```
Admin logs in
  ↓
Check: role='admin'? YES
  ↓
Check: admin_churches? [Trinity, Grace]
  ↓
Show dashboard with Trinity + Grace options
  ↓
Click on church to view/manage it
```

### Flow 3: Super Admin Views All, Church Admin Views One

```
Super Admin:
├─ admin_churches = [Trinity, Grace, Faith]
├─ Sees all churches in dashboard
└─ Can switch between any church

Church Admin (Trinity):
├─ admin_churches = [Trinity]
├─ Sees only Trinity in dashboard
└─ Can only manage Trinity
```

---

## RLS Policy Implementation

### Current RLS (for churches table)
```sql
-- Any authenticated user can see all churches
CREATE POLICY "churches_select"
  ON churches FOR SELECT
  USING (auth.role() = 'authenticated');
```

### New RLS (for churches table)
```sql
-- Super admin can see all churches
-- Church admin can see only their assigned churches
-- Regular users see no churches (handled separately)
CREATE POLICY "churches_select"
  ON churches FOR SELECT
  USING (
    -- Super admin sees all
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    AND (SELECT admin_churches FROM users WHERE id = auth.uid()) IS NOT NULL

    -- Church admin sees their churches
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND churches.id = ANY(admin_churches)
    )
  );
```

---

## Implementation Checklist

### Database
- [ ] Add `admin_churches` column to users table
- [ ] Create index on `admin_churches`
- [ ] Migrate existing admins (set admin_churches to all churches)
- [ ] Update RLS policies

### API
- [ ] Add `getCurrentAdmin()` function
- [ ] Add `canAdministerChurch()` function
- [ ] Add `getAdminChurches()` function
- [ ] Add `updateAdminChurches()` function
- [ ] Add `createAdmin()` function with church assignment

### Super Admin Portal
- [ ] Add "Manage Admins" section
- [ ] Show admins per church
- [ ] Add/remove admins from churches
- [ ] Create new admin with church assignment
- [ ] Display admin's assigned churches

### Testing
- [ ] Test super admin sees all churches
- [ ] Test church admin sees only their churches
- [ ] Test RLS prevents unauthorized access
- [ ] Test admin can manage their church
- [ ] Test admin cannot manage other churches

---

## Migration Plan

### For Existing Admins

When implementing this change, existing admins need to be assigned to churches:

```sql
-- Option 1: Assign existing admins to ALL churches (super admin)
UPDATE users
SET admin_churches = (
  SELECT array_agg(id) FROM churches
)
WHERE role = 'admin'
AND admin_churches IS NULL;

-- Option 2: Assign specific admins to specific churches
UPDATE users
SET admin_churches = ARRAY[
  (SELECT id FROM churches WHERE slug = 'trinity')
]
WHERE email = 'john@example.com';
```

---

## Security Considerations

### ✅ What's Protected

```
- Admins can only view churches in their admin_churches list
- RLS enforces this at database level
- API checks before returning data
- Frontend shows only accessible churches
```

### ⚠️ Edge Cases to Handle

```
1. Admin removed from church while viewing it
   → Redirect to available church or logout

2. Admin added to new church
   → Refresh to see new church in list

3. Last admin removed from church
   → Church still exists, just unmanaged

4. Super admin sets their own admin_churches = []
   → Cannot access anything (prevented in UI)
```

---

## Backward Compatibility

### Old Code (Won't Work)
```javascript
// Assumes all admins can see everything
window.location.href = '/super-admin-portal.html';
```

### New Code
```javascript
// Check what churches admin can access
const churches = await API.getAdminChurches();
if (churches.length === 0) {
  alert('No churches assigned');
  return;
}
// Show only assigned churches
```

---

## Benefits

✅ **Security**: Admins only see their churches
✅ **Scalability**: Can have multiple admins per church
✅ **Organization**: Clear separation of responsibilities
✅ **Trust**: Each church's data is isolated
✅ **Audit**: Can track which admin manages which church
✅ **Flexibility**: Easy to add/remove admin access

---

## Future Enhancements

1. **Role-based permissions within admin**
   - View-only admin
   - Settings-only admin
   - Full admin

2. **Audit logging**
   - Track admin actions
   - See who changed what

3. **Admin invitations**
   - Send email to new admin
   - They set password on first login

4. **Admin deactivation**
   - Temporarily disable without deleting

---

## Summary

This architecture allows:
- ✅ Multiple admins per church (unlimited)
- ✅ Admins assigned to specific churches
- ✅ Super admins who see everything
- ✅ Church-specific admin isolation
- ✅ Easy to scale to many churches

After this is implemented, the donation feature can build on this foundation.

---

**Date**: 2025-10-25
**Status**: 🔷 Architecture & Design Complete - Ready for Implementation

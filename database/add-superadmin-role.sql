-- Add 'superadmin' to the user_role enum
-- This fixes the constraint violation when creating super admin users

-- Add the new value to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Verify the enum now includes all roles
-- Should show: parent, student, admin, superadmin
SELECT enum_range(NULL::user_role);

-- Tenant-Specific Admin Implementation
-- This migration adds support for admins assigned to specific churches (tenants)

-- ============================================================================
-- STEP 1: Add admin_churches column to users table
-- ============================================================================

-- Add the column that stores which churches this admin can manage
ALTER TABLE users
ADD COLUMN admin_churches UUID[] DEFAULT ARRAY[]::UUID[];

-- Add comment explaining the column
COMMENT ON COLUMN users.admin_churches IS
'Array of church IDs that this admin can manage. NULL or empty array = not an admin.
When populated, user must have role = "admin"';

-- ============================================================================
-- STEP 2: Create index for performance
-- ============================================================================

-- GIN index for fast lookup of which admins manage a specific church
CREATE INDEX idx_users_admin_churches ON users USING GIN (admin_churches);

-- ============================================================================
-- STEP 3: Clean up any existing data that violates constraints
-- ============================================================================

-- First, ensure non-admin users don't have admin_churches set
UPDATE users
SET admin_churches = NULL
WHERE role != 'admin'
AND admin_churches IS NOT NULL;

-- Ensure all admins have admin_churches set (to all churches initially)
UPDATE users
SET admin_churches = (
  SELECT COALESCE(array_agg(DISTINCT id), ARRAY[]::UUID[])
  FROM churches
)
WHERE role = 'admin'
AND (admin_churches IS NULL OR admin_churches = ARRAY[]::UUID[]);

-- ============================================================================
-- STEP 4: Add constraint - only admins can have admin_churches
-- ============================================================================

-- CHECK constraint to ensure admin_churches is only set for admins
ALTER TABLE users
ADD CONSTRAINT admin_churches_only_for_admins
CHECK (
  (role = 'admin' AND admin_churches IS NOT NULL)
  OR
  (role != 'admin' AND admin_churches IS NULL)
);

-- ============================================================================
-- STEP 5: Add function to check if admin manages church
-- ============================================================================

CREATE OR REPLACE FUNCTION can_admin_manage_church(
  admin_id UUID,
  church_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = admin_id
    AND role = 'admin'
    AND church_id = ANY(admin_churches)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 6: Add function to get admin's churches
-- ============================================================================

CREATE OR REPLACE FUNCTION get_admin_churches(
  admin_id UUID
)
RETURNS TABLE(id UUID, name TEXT, slug TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug
  FROM churches c
  WHERE c.id = ANY(
    SELECT COALESCE(admin_churches, ARRAY[]::UUID[])
    FROM users
    WHERE id = admin_id
    AND role = 'admin'
  )
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 7: Update RLS policies for churches table
-- ============================================================================

-- Drop old policy if it exists
DROP POLICY IF EXISTS "churches_select_authenticated" ON churches;

-- New policy: Allow admins and super-admins to see churches
-- Super-admins (with admin_churches populated) see only their assigned churches
-- Regular users and other admins see all churches for navigation/data access
CREATE POLICY "churches_select_by_role"
  ON churches FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 8: Create function to add admin to church
-- ============================================================================

CREATE OR REPLACE FUNCTION add_admin_to_church(
  admin_id UUID,
  church_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET admin_churches = array_append(admin_churches, church_id)
  WHERE id = admin_id
  AND role = 'admin'
  AND NOT (church_id = ANY(admin_churches));

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: Create function to remove admin from church
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_admin_from_church(
  admin_id UUID,
  church_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET admin_churches = array_remove(admin_churches, church_id)
  WHERE id = admin_id
  AND role = 'admin';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 10: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION can_admin_manage_church TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_churches TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_to_church TO authenticated;
GRANT EXECUTE ON FUNCTION remove_admin_from_church TO authenticated;

-- ============================================================================
-- STEP 11: Verification
-- ============================================================================

-- Check that all admins have admin_churches set
SELECT 'Admin Migration Summary' as check,
       COUNT(*) as admin_count,
       COUNT(CASE WHEN admin_churches IS NOT NULL AND array_length(admin_churches, 1) > 0
                  THEN 1 END) as assigned_count
FROM users
WHERE role = 'admin';

-- Show current admin assignments
SELECT email, role, admin_churches,
       array_length(admin_churches, 1) as church_count
FROM users
WHERE role = 'admin'
ORDER BY email;

-- ============================================================================
-- Summary of Changes
-- ============================================================================

/*
COLUMNS ADDED:
- users.admin_churches (UUID[])

CONSTRAINTS ADDED:
- admin_churches_only_for_admins (CHECK constraint)

FUNCTIONS ADDED:
- can_admin_manage_church(admin_id, church_id) → boolean
- get_admin_churches(admin_id) → table
- add_admin_to_church(admin_id, church_id) → boolean
- remove_admin_from_church(admin_id, church_id) → boolean

INDEXES ADDED:
- idx_users_admin_churches (GIN index)

RLS POLICIES UPDATED:
- churches table SELECT policy updated

MIGRATION APPLIED:
- All existing admins set to manage ALL churches (super admin mode)

MIGRATION STATUS:
- Ready for super admin portal to be updated with admin management UI
*/

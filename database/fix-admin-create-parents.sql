-- Fix: Allow admins to update users in their church (needed for creating parents)
-- This RLS policy is needed so admins can set church_id when creating new parent accounts

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a more permissive policy that allows:
-- 1. Users to update their own profile
-- 2. Admins to update users in their church
CREATE POLICY "Users can update own profile or admins can update church users" ON users
    FOR UPDATE USING (
        -- Allow users to update their own record
        auth.uid() = id
        OR
        -- Allow admins to update users in their church
        (
            SELECT role FROM users WHERE id = auth.uid()
        ) = 'admin'
        AND church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- Fix RLS Policies for student_invites table
-- Run this if you get "permission denied for table student_invites"

-- First, drop existing policies (in case they're incorrect)
DROP POLICY IF EXISTS "Parents can view their own invites" ON student_invites;
DROP POLICY IF EXISTS "Parents can create invites" ON student_invites;
DROP POLICY IF EXISTS "Admins can view church invites" ON student_invites;

-- Make sure RLS is enabled
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- Policy 1: Parents can view invites they created
CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

-- Policy 2: Parents can create invites (INSERT)
CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- Policy 3: Admins can view all invites in their church
CREATE POLICY "Admins can view church invites"
    ON student_invites FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'student_invites';

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'student_invites'
ORDER BY policyname;

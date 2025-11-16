-- Aggressive RLS Fix for student_invites
-- This completely removes and recreates RLS from scratch

-- Step 1: Disable RLS completely first
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Parents can view their own invites" ON student_invites;
DROP POLICY IF EXISTS "Parents can create invites" ON student_invites;
DROP POLICY IF EXISTS "Admins can view church invites" ON student_invites;
DROP POLICY IF EXISTS "Allow all operations" ON student_invites;

-- Step 3: Re-enable RLS
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple permissive policy first (allow all for testing)
CREATE POLICY "Allow authenticated users" ON student_invites
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'student_invites';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'student_invites';

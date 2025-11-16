-- Check current RLS status and policies

-- 1. Check if table exists
SELECT tablename FROM pg_tables
WHERE tablename = 'student_invites' AND schemaname = 'public';

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'student_invites' AND schemaname = 'public';

-- 3. Check all policies
SELECT
    policyname,
    tablename,
    roles,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'student_invites' AND schemaname = 'public'
ORDER BY policyname;

-- 4. Check if user exists in users table
SELECT COUNT(*) as user_count FROM users;

-- 5. Get current user info
SELECT * FROM auth.users() LIMIT 1;

-- 6. Check your current user's church
SELECT u.id, u.email, u.role, u.church_id
FROM users u
WHERE u.id = auth.uid();

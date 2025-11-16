-- Check the actual structure of student_invites table

-- 1. Get all columns in the table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'student_invites'
ORDER BY ordinal_position;

-- 2. Get table constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'student_invites';

-- 3. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'student_invites'
) as table_exists;

-- 4. Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'student_invites';

-- 5. Try a simple select (this might show the real error)
SELECT COUNT(*) FROM student_invites;

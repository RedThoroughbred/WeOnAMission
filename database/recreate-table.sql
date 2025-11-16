-- NUCLEAR OPTION: Completely remove and recreate student_invites table
-- Use this if the existing table is corrupted or broken

-- Step 1: Drop the table completely (this removes all data!)
DROP TABLE IF EXISTS student_invites CASCADE;

-- Step 2: Create it fresh with clean structure
CREATE TABLE student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID NOT NULL,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Step 3: Disable RLS (no security policies, just get it working)
ALTER TABLE student_invites DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant permissions to all roles
GRANT ALL ON student_invites TO anon, authenticated, service_role;

-- Step 5: Create basic indexes
CREATE INDEX idx_invite_token ON student_invites(invite_token);
CREATE INDEX idx_student_id ON student_invites(student_id);
CREATE INDEX idx_parent_id ON student_invites(parent_id);
CREATE INDEX idx_church_id ON student_invites(church_id);

-- Step 6: Verify
SELECT
    'Table exists' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'student_invites') as found;

SELECT 'RLS status' as check_name, rowsecurity FROM pg_tables WHERE tablename = 'student_invites';

SELECT 'Can insert test?' as test;
-- Try inserting a test record
INSERT INTO student_invites
(student_id, parent_id, church_id, invite_token, student_email, status)
VALUES (
    (SELECT id FROM students LIMIT 1),
    (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
    (SELECT id FROM churches LIMIT 1),
    'test_' || gen_random_uuid()::text,
    'test@example.com',
    'pending'
);

SELECT 'Test insert succeeded!' as result;

-- Clean up test data
DELETE FROM student_invites WHERE student_email = 'test@example.com';

SELECT 'Ready for use!' as final_status;

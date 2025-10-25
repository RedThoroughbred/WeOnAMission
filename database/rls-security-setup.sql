-- Comprehensive RLS Security Setup for Mission Trip Platform
-- This replaces the overly-permissive grants with proper role-based security

-- ==================== STEP 1: REMOVE OVERLY-PERMISSIVE GRANTS ====================

-- Revoke broad grants from anon and authenticated roles
REVOKE ALL PRIVILEGES ON students FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON payments FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON payment_config FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON documents FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON trip_memories FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON user_questions FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON question_responses FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON faqs FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON content_items FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON events FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON resources FROM anon, authenticated;

-- ==================== STEP 2: ENABLE RLS ON ALL TABLES ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- ==================== STEP 3: DROP OLD POLICIES ====================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert" ON users;
DROP POLICY IF EXISTS "Public read events" ON events;
DROP POLICY IF EXISTS "Public read resources" ON resources;
DROP POLICY IF EXISTS "Public read faqs" ON faqs;
DROP POLICY IF EXISTS "Public read content items" ON content_items;
DROP POLICY IF EXISTS "Public read memories" ON trip_memories;
DROP POLICY IF EXISTS "Public submit questions" ON user_questions;
DROP POLICY IF EXISTS "Public read questions" ON user_questions;
DROP POLICY IF EXISTS "Public read responses" ON question_responses;
DROP POLICY IF EXISTS "Allow all access to users" ON users;

-- ==================== STEP 4: USERS TABLE POLICIES ====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can insert during signup (trigger creates the record)
CREATE POLICY "Allow signup" ON users
    FOR INSERT WITH CHECK (true);

-- ==================== STEP 5: STUDENTS TABLE POLICIES ====================

-- Parents can view their own students
CREATE POLICY "Parents can view own students" ON students
    FOR SELECT USING (parent_id = auth.uid());

-- Parents can insert their own students
CREATE POLICY "Parents can insert own students" ON students
    FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Parents can update their own students
CREATE POLICY "Parents can update own students" ON students
    FOR UPDATE USING (parent_id = auth.uid());

-- ==================== STEP 6: PAYMENTS TABLE POLICIES ====================

-- Parents can view payments for their students
CREATE POLICY "Parents can view payments for their students" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- ==================== STEP 7: PAYMENT CONFIG TABLE POLICIES ====================

-- Parents can view payment config for their students
CREATE POLICY "Parents can view payment config for their students" ON payment_config
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- ==================== STEP 8: DOCUMENTS TABLE POLICIES ====================

-- Parents can view documents for their students
CREATE POLICY "Parents can view documents for their students" ON documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- Parents can upload documents for their students
CREATE POLICY "Parents can upload documents for their students" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- ==================== STEP 9: TRIP MEMORIES TABLE POLICIES ====================

-- Students can view their own memories
CREATE POLICY "Students can view own memories" ON trip_memories
    FOR SELECT USING (student_id = auth.uid());

-- Students can insert memories
CREATE POLICY "Students can insert memories" ON trip_memories
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Anyone can view approved memories (public gallery)
CREATE POLICY "Anyone can view approved memories" ON trip_memories
    FOR SELECT USING (status = 'approved');

-- ==================== STEP 10: EVENTS TABLE POLICIES ====================

-- Anyone can view events that are set to display on calendar
CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (display_on_calendar = true);

-- ==================== STEP 11: RESOURCES TABLE POLICIES ====================

-- Anyone can view resources
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

-- ==================== STEP 12: USER QUESTIONS TABLE POLICIES ====================

-- Anyone can submit questions
CREATE POLICY "Anyone can submit questions" ON user_questions
    FOR INSERT WITH CHECK (true);

-- Users can view their own questions
CREATE POLICY "Users can view own questions" ON user_questions
    FOR SELECT USING (user_id = auth.uid() OR email = current_user_email());

-- ==================== STEP 13: QUESTION RESPONSES TABLE POLICIES ====================

-- Users can view responses to their questions
CREATE POLICY "Users can view responses to own questions" ON question_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_questions uq
            WHERE uq.id = question_id AND (uq.user_id = auth.uid() OR auth.jwt()->>'role' = 'service_role')
        )
    );

-- ==================== STEP 14: FAQs TABLE POLICIES ====================

-- Anyone can view FAQs that are marked as display=true
CREATE POLICY "Anyone can view faqs" ON faqs
    FOR SELECT USING (display = true);

-- ==================== STEP 15: CONTENT ITEMS TABLE POLICIES ====================

-- Anyone can view content items that are marked as display=true
CREATE POLICY "Anyone can view content items" ON content_items
    FOR SELECT USING (display = true);

-- ==================== STEP 16: GRANT MINIMAL PERMISSIONS ====================

-- Grant basic schema access to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on public read tables
GRANT SELECT ON events TO authenticated;
GRANT SELECT ON resources TO authenticated;
GRANT SELECT ON faqs TO authenticated;
GRANT SELECT ON content_items TO authenticated;

-- Grant INSERT on question submission
GRANT INSERT ON user_questions TO authenticated;
GRANT SELECT ON question_responses TO authenticated;

-- Grant full access on user's own data
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT SELECT ON payment_config TO authenticated;
GRANT SELECT, INSERT ON documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON trip_memories TO authenticated;

-- ==================== STEP 17: VERIFY SETUP ====================

-- Check that RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies created
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

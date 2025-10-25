-- Multi-Tenant Migration for WeOnAMission
-- Run this in Supabase SQL Editor to convert to multi-tenant architecture
-- This adds church_id to all tables and creates the churches table

-- ==================== STEP 1: CREATE CHURCHES TABLE ====================

CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    website TEXT,
    admin_user_id UUID REFERENCES users(id),
    is_super_admin BOOLEAN DEFAULT false,

    -- Church-specific settings (JSON)
    settings JSONB DEFAULT '{
        "primaryColor": "#1976d2",
        "secondaryColor": "#1565c0",
        "tripName": "Mission Trip",
        "tripCost": 2500.00,
        "tripDepartureDate": "2026-06-26",
        "tripReturnDate": "2026-07-05",
        "destination": "",
        "logo": ""
    }'::jsonb,

    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on churches table
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_churches_slug ON churches(slug);
CREATE INDEX idx_churches_admin_user_id ON churches(admin_user_id);

-- ==================== STEP 2: ADD church_id TO USERS TABLE ====================

ALTER TABLE users ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_users_church_id ON users(church_id);

-- ==================== STEP 3: ADD church_id TO ALL DATA TABLES ====================

-- Students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_students_church_id ON students(church_id);

-- Payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payments_church_id ON payments(church_id);

-- Payment config table
ALTER TABLE payment_config ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_config_church_id ON payment_config(church_id);

-- Documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_documents_church_id ON documents(church_id);

-- Trip memories table
ALTER TABLE trip_memories ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_trip_memories_church_id ON trip_memories(church_id);

-- Events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_church_id ON events(church_id);

-- Resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_resources_church_id ON resources(church_id);

-- User questions table
ALTER TABLE user_questions ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_questions_church_id ON user_questions(church_id);

-- Question responses table
ALTER TABLE question_responses ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_question_responses_church_id ON question_responses(church_id);

-- FAQs table
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_faqs_church_id ON faqs(church_id);

-- Content items table
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_content_items_church_id ON content_items(church_id);

-- ==================== STEP 4: MIGRATE EXISTING DATA TO TRINITY CHURCH ====================

-- First, create Trinity Church
INSERT INTO churches (id, name, slug, description, admin_user_id)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Trinity Church',
    'trinity',
    'The first church using WeOnAMission',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1)  -- Assign first admin as church admin
)
ON CONFLICT DO NOTHING;

-- Migrate all users to Trinity Church (if church_id is null)
UPDATE users SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all students to Trinity Church
UPDATE students SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all payments to Trinity Church
UPDATE payments SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all payment_config to Trinity Church
UPDATE payment_config SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all documents to Trinity Church
UPDATE documents SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all trip_memories to Trinity Church
UPDATE trip_memories SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all events to Trinity Church
UPDATE events SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all resources to Trinity Church
UPDATE resources SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all user_questions to Trinity Church
UPDATE user_questions SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all question_responses to Trinity Church
UPDATE question_responses SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all faqs to Trinity Church
UPDATE faqs SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- Migrate all content_items to Trinity Church
UPDATE content_items SET church_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE church_id IS NULL;

-- ==================== STEP 5: SET NOT NULL CONSTRAINTS ====================

ALTER TABLE users ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE students ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE payment_config ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE trip_memories ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE resources ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE user_questions ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE question_responses ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE faqs ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE content_items ALTER COLUMN church_id SET NOT NULL;

-- ==================== STEP 6: RLS POLICIES FOR MULTI-TENANT ====================

-- Drop old RLS policies that aren't church-aware
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow signup" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert" ON users;
DROP POLICY IF EXISTS "Parents can view own students" ON students;
DROP POLICY IF EXISTS "Parents can insert own students" ON students;
DROP POLICY IF EXISTS "Parents can update own students" ON students;
DROP POLICY IF EXISTS "Parents can view payments for their students" ON payments;
DROP POLICY IF EXISTS "Parents can view payment config for their students" ON payment_config;
DROP POLICY IF EXISTS "Parents can view documents for their students" ON documents;
DROP POLICY IF EXISTS "Parents can upload documents for their students" ON documents;
DROP POLICY IF EXISTS "Students can view their own memories" ON trip_memories;
DROP POLICY IF EXISTS "Students can insert memories" ON trip_memories;
DROP POLICY IF EXISTS "Anyone can view approved memories" ON trip_memories;
DROP POLICY IF EXISTS "Anyone can view public events" ON events;
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Anyone can submit questions" ON user_questions;
DROP POLICY IF EXISTS "Users can view own questions" ON user_questions;
DROP POLICY IF EXISTS "Users can view responses to own questions" ON question_responses;
DROP POLICY IF EXISTS "Anyone can view faqs" ON faqs;
DROP POLICY IF EXISTS "Anyone can view content items" ON content_items;

-- ==================== RLS: Churches Table ====================

CREATE POLICY "Users can view churches they belong to" ON churches
    FOR SELECT USING (
        id IN (SELECT church_id FROM users WHERE id = auth.uid())
        OR is_super_admin = true
    );

-- ==================== RLS: Users Table ====================

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Church admins can view their church users" ON users
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow signup" ON users
    FOR INSERT WITH CHECK (true);

-- ==================== RLS: Students Table ====================

CREATE POLICY "Users can access their church's students" ON students
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Parents can insert students in their church" ON students
    FOR INSERT WITH CHECK (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Parents can update students in their church" ON students
    FOR UPDATE USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Payments Table ====================

CREATE POLICY "Users can access their church's payments" ON payments
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Payment Config Table ====================

CREATE POLICY "Users can access their church's payment config" ON payment_config
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Documents Table ====================

CREATE POLICY "Users can access their church's documents" ON documents
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can upload documents in their church" ON documents
    FOR INSERT WITH CHECK (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Trip Memories Table ====================

CREATE POLICY "Users can access their church's memories" ON trip_memories
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert memories in their church" ON trip_memories
    FOR INSERT WITH CHECK (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Events Table ====================

CREATE POLICY "Users can access their church's events" ON events
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Resources Table ====================

CREATE POLICY "Users can access their church's resources" ON resources
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: User Questions Table ====================

CREATE POLICY "Users can access their church's questions" ON user_questions
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Anyone can submit questions in their church" ON user_questions
    FOR INSERT WITH CHECK (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Question Responses Table ====================

CREATE POLICY "Users can access their church's responses" ON question_responses
    FOR SELECT USING (
        question_id IN (
            SELECT id FROM user_questions
            WHERE church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
        )
    );

-- ==================== RLS: FAQs Table ====================

CREATE POLICY "Users can access their church's faqs" ON faqs
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== RLS: Content Items Table ====================

CREATE POLICY "Users can access their church's content" ON content_items
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- ==================== STEP 7: VERIFY MIGRATION ====================

SELECT 'Trinity Church created. Check that:' AS status;
SELECT COUNT(*) as trinity_users FROM users WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) as trinity_students FROM students WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) as trinity_events FROM events WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) as all_churches FROM churches;

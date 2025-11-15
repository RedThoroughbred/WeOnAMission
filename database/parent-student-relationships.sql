-- Parent-Student Relationships and User Linking Migration
-- This enables multiple parents per student and links student users to student records

-- ==================== STEP 1: Add user_id to students table ====================
-- Links student records to student user accounts (optional link)
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

COMMENT ON COLUMN students.user_id IS 'Optional link to user account if student has login access';

-- ==================== STEP 2: Create parent_students junction table ====================
-- Supports many-to-many: multiple parents can be responsible for one student
CREATE TABLE IF NOT EXISTS parent_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship TEXT, -- 'mother', 'father', 'guardian', etc.
    is_primary BOOLEAN DEFAULT false, -- designate primary contact
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);

-- Enable RLS
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;

-- ==================== STEP 3: RLS Policies for parent_students ====================

-- Parents can view their own student relationships
CREATE POLICY "Parents can view own student relationships" ON parent_students
    FOR SELECT USING (parent_id = auth.uid());

-- Church admins can view relationships for their church students
CREATE POLICY "Admins can view church student relationships" ON parent_students
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students
            WHERE church_id IN (
                SELECT church_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Super admins can view all relationships
CREATE POLICY "Super admins can view all relationships" ON parent_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Admins can manage relationships for their church
CREATE POLICY "Admins can manage church relationships" ON parent_students
    FOR ALL USING (
        student_id IN (
            SELECT id FROM students
            WHERE church_id IN (
                SELECT church_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
            )
        )
    );

-- ==================== STEP 4: Migration of existing data ====================
-- Migrate existing parent_id relationships to the junction table
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
SELECT parent_id, id, 'primary', true
FROM students
WHERE parent_id IS NOT NULL
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- Note: Keep parent_id column for backward compatibility during transition
-- You can drop it later with: ALTER TABLE students DROP COLUMN parent_id;

-- ==================== STEP 5: Helper views ====================

-- View to easily see parent-student relationships with names
CREATE OR REPLACE VIEW parent_student_details AS
SELECT
    ps.id,
    ps.parent_id,
    ps.student_id,
    ps.relationship,
    ps.is_primary,
    u.full_name as parent_name,
    u.email as parent_email,
    u.phone as parent_phone,
    s.full_name as student_name,
    s.grade as student_grade,
    s.church_id
FROM parent_students ps
JOIN users u ON ps.parent_id = u.id
JOIN students s ON ps.student_id = s.id;

COMMENT ON VIEW parent_student_details IS 'Helper view showing parent-student relationships with denormalized data';

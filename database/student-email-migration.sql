-- Student Email Population Migration
-- This migration adds email column to students table and populates it from student_invites

-- ============================================================================
-- STEP 1: Add email column to students table (if it doesn't exist)
-- ============================================================================

ALTER TABLE students
ADD COLUMN email TEXT;

-- ============================================================================
-- STEP 2: Populate email from student_invites for students with accepted invites
-- ============================================================================

UPDATE students
SET email = si.student_email
FROM student_invites si
WHERE students.id = si.student_id
  AND si.status = 'accepted'
  AND students.email IS NULL;

-- ============================================================================
-- STEP 3: Add index for email lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- ============================================================================
-- STEP 4: Add constraint to ensure email is unique per church (optional)
-- ============================================================================

-- This ensures no duplicate emails within a church (you may want to adjust this)
-- Commented out for now as it may cause issues with existing data
-- ALTER TABLE students
-- ADD CONSTRAINT unique_email_per_church UNIQUE (church_id, email);

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Email will now be populated when a student completes signup via acceptStudentInvite()
-- - For students that signed up before this migration, email will be backfilled from student_invites
-- - Future signups will automatically populate email from inviteData.student_email

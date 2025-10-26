-- Add Profile Fields to Users Table
-- This migration adds student-related profile fields to the users table

-- ============================================================================
-- STEP 1: Add columns to users table
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS medical_info TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

-- ============================================================================
-- STEP 2: Backfill from students table where applicable
-- ============================================================================

-- For students, copy their profile data from students table to users table
UPDATE users u
SET
  date_of_birth = s.date_of_birth,
  emergency_contact_name = s.emergency_contact_name,
  emergency_contact_phone = s.emergency_contact_phone,
  medical_info = s.medical_info,
  allergies = s.allergies,
  dietary_restrictions = s.dietary_restrictions
FROM students s
WHERE u.id = s.user_id
  AND u.role = 'student'
  AND (u.date_of_birth IS NULL OR u.emergency_contact_name IS NULL);

-- ============================================================================
-- STEP 3: Create indexes for commonly searched fields
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

-- ============================================================================
-- NOTES
-- ============================================================================
-- - All profile fields are now in the users table for easy access
-- - Students can update their own profile information
-- - Admins can view/update student profile information
-- - No need to join with students table for basic profile info

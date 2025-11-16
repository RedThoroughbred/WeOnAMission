-- Student Enrollment System Setup
-- Enables parent to invite students and students to create accounts via invite links

-- 1. Add user_id to students table (links student to user account)
ALTER TABLE students
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create student_invites table
CREATE TABLE IF NOT EXISTS student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,

    -- Invite details
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- valid statuses: pending, accepted, expired

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired')),
    CONSTRAINT valid_email CHECK (student_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for performance (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_invite_token ON student_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_student_id ON student_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_church_id ON student_invites(church_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON student_invites(parent_id);
CREATE INDEX IF NOT EXISTS idx_status ON student_invites(status);

-- 3. Enable RLS on student_invites
ALTER TABLE student_invites ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for student_invites
-- Parents can see invites they created
CREATE POLICY "Parents can view their own invites"
    ON student_invites FOR SELECT
    USING (parent_id = auth.uid());

-- Parents can create invites
CREATE POLICY "Parents can create invites"
    ON student_invites FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- Admins can view all invites in their church
CREATE POLICY "Admins can view church invites"
    ON student_invites FOR SELECT
    USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Create function to auto-expire old invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
    UPDATE student_invites
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Create partial index for querying pending invites efficiently
-- Note: We use status only instead of expires_at condition since NOW() is not immutable
CREATE INDEX IF NOT EXISTS idx_pending_invites ON student_invites(invite_token)
WHERE status = 'pending';

-- SIMPLE FIX for document upload & churches errors
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- ============================================================================
-- FIX 1: CHURCHES TABLE (fixes 403 Forbidden error)
-- ============================================================================

ALTER TABLE churches DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON churches TO authenticated;
GRANT SELECT ON churches TO anon;

-- ============================================================================
-- FIX 2: CREATE STORAGE BUCKETS (fixes bucket not found error)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Grant storage permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- ============================================================================
-- FIX 3: RECREATE PAYMENT_SUMMARIES VIEW (fixes missing church_id)
-- ============================================================================

DROP VIEW IF EXISTS payment_summaries CASCADE;

CREATE OR REPLACE VIEW payment_summaries AS
SELECT
    s.id as student_id,
    s.full_name as student_name,
    s.church_id,
    c.name as church_name,
    COALESCE(SUM(p.amount), 0) as total_paid,
    (c.settings->>'tripCost')::numeric as trip_cost,
    (c.settings->>'tripCost')::numeric - COALESCE(SUM(p.amount), 0) as balance_due,
    COUNT(p.id) as payment_count,
    MAX(p.payment_date) as last_payment_date
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
JOIN churches c ON s.church_id = c.id
GROUP BY s.id, s.full_name, s.church_id, c.id, c.name, c.settings;

GRANT SELECT ON payment_summaries TO authenticated;
GRANT SELECT ON payment_summaries TO anon;

-- ============================================================================
-- FIX 4: DOCUMENTS TABLE PERMISSIONS
-- ============================================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow users to see documents for their church
CREATE POLICY "Users can see documents for their church"
ON documents FOR SELECT
USING (
    church_id IN (
        SELECT church_id FROM users WHERE id = auth.uid()
    )
);

-- Allow users to upload documents
CREATE POLICY "Users can upload documents"
ON documents FOR INSERT
WITH CHECK (
    church_id IN (
        SELECT church_id FROM users WHERE id = auth.uid()
    )
);

-- ============================================================================
-- DONE!
-- ============================================================================
-- Run these verification queries to confirm fixes worked:

-- Check 1: Churches RLS disabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'churches';
-- Expected: rowsecurity = false

-- Check 2: Storage buckets created
-- SELECT id, name FROM storage.buckets WHERE id IN ('documents', 'trip-photos');
-- Expected: 2 rows

-- Check 3: Payment summaries has church_id
-- SELECT * FROM payment_summaries LIMIT 1;
-- Expected: columns include church_id, student_id, total_paid, balance_due

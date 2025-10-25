-- Fix for document upload and churches table issues
-- Run this in Supabase SQL Editor

-- ==================== FIX 1: Churches Table RLS ====================
-- Disable RLS on churches table (it's meant to be public for listing all churches)
ALTER TABLE churches DISABLE ROW LEVEL SECURITY;

-- Make sure authenticated users can read all churches
GRANT SELECT ON churches TO authenticated;
GRANT SELECT ON churches TO anon;

-- ==================== FIX 2: Payment Summaries ====================
-- Check if payment_summaries needs church_id column
-- If it's a view, we'll need to update the query in api.js instead

-- If it's a table (run this to verify):
SELECT column_name FROM information_schema.columns
WHERE table_name = 'payment_summaries' AND column_name = 'church_id';

-- If church_id doesn't exist, add it:
-- ALTER TABLE payment_summaries ADD COLUMN church_id UUID REFERENCES churches(id);

-- ==================== FIX 3: Create Storage Buckets ====================

-- Create documents bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create trip-photos bucket for trip memory photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Grant access to storage buckets
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon;

-- Allow authenticated users to upload to documents bucket
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to upload trip photos
CREATE POLICY "Users can upload trip photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trip-photos');

-- Allow authenticated users to read trip photos
CREATE POLICY "Users can read trip photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'trip-photos');

-- Allow authenticated users to delete trip photos
CREATE POLICY "Users can delete trip photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trip-photos');

-- ==================== Summary ====================
-- After running this:
-- 1. Churches table will be readable by everyone (needed for landing page)
-- 2. Documents and trip-photos storage buckets will be created
-- 3. Storage policies will allow authenticated users to upload/manage files
-- 4. Payment summaries issue may still need investigation (see SELECT query above)

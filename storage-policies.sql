-- Storage Bucket Policies
-- Run these in Supabase SQL Editor after creating the storage buckets

-- Policy for 'documents' bucket (parent uploads)
-- Parents can upload documents for their students
CREATE POLICY "Parents can upload documents for their students"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM students WHERE parent_id = auth.uid()
    )
);

-- Parents can view documents for their students
CREATE POLICY "Parents can view their students documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM students WHERE parent_id = auth.uid()
    )
);

-- Admins can do everything with documents
CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy for 'trip-photos' bucket (student submissions)
-- Students (via parents) can upload photos
CREATE POLICY "Students can upload trip photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'trip-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM students WHERE parent_id = auth.uid()
    )
);

-- Students can view their own photos
CREATE POLICY "Students can view their photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'trip-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM students WHERE parent_id = auth.uid()
    )
);

-- Admins can manage all trip photos
CREATE POLICY "Admins can manage all trip photos"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'trip-photos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'trip-photos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy for 'resources' bucket (admin uploads, public read)
-- Admins can upload resources
CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resources'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Anyone can view resources (public)
CREATE POLICY "Anyone can view resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Admins can manage all resources
CREATE POLICY "Admins can manage resources"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'resources'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'resources'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSTRUCTIONS:
-- 1. Create the following storage buckets in Supabase Dashboard:
--    - documents (Private)
--    - trip-photos (Private)
--    - resources (Public)
--
-- 2. For each bucket, set these settings:
--    - Max file size: 10MB (or adjust as needed)
--    - Allowed MIME types: 
--      * documents: application/pdf, image/*, application/msword, etc.
--      * trip-photos: image/*
--      * resources: application/pdf, image/*, video/*
--
-- 3. Run this SQL in the SQL Editor to apply the policies

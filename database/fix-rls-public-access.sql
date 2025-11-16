-- Fix RLS Policies for Public Access to Homepage Data
-- ======================================================
-- This allows unauthenticated users to view events, resources, and FAQs
--
-- PROBLEM: The multi-tenant migration created overly restrictive policies that required:
--   1. User to be authenticated (auth.uid() must exist)
--   2. User to belong to the church (church_id IN user's church)
--
-- But the homepage works WITHOUT authentication, so these policies break it!
--
-- SOLUTION: Allow public read access while keeping admin protections for write operations

-- ==================== Drop Old Restrictive Policies ====================

DROP POLICY IF EXISTS "Users can access their church's events" ON events;
DROP POLICY IF EXISTS "Users can access their church's resources" ON resources;
DROP POLICY IF EXISTS "Users can access their church's faqs" ON faqs;
DROP POLICY IF EXISTS "Users can access their church's memories" ON trip_memories;

-- ==================== RLS: Events Table ====================
-- Allow PUBLIC READ (anyone can see events)
-- Admins can CREATE/UPDATE events for their church

CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);  -- Public read - no auth required

CREATE POLICY "Admins can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = events.church_id
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update events" ON events
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = events.church_id
            AND users.role = 'admin'
        )
    );

-- ==================== RLS: Resources Table ====================
-- Allow PUBLIC READ (anyone can see resources)
-- Admins can CREATE/UPDATE resources for their church

CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);  -- Public read

CREATE POLICY "Admins can create resources" ON resources
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = resources.church_id
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update resources" ON resources
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = resources.church_id
            AND users.role = 'admin'
        )
    );

-- ==================== RLS: FAQs Table ====================
-- Allow PUBLIC READ (anyone can see FAQs)
-- Admins can CREATE/UPDATE FAQs for their church

CREATE POLICY "Anyone can view faqs" ON faqs
    FOR SELECT USING (true);  -- Public read

CREATE POLICY "Admins can create faqs" ON faqs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = faqs.church_id
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update faqs" ON faqs
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = faqs.church_id
            AND users.role = 'admin'
        )
    );

-- ==================== RLS: Trip Memories Table ====================
-- Allow PUBLIC READ of APPROVED memories only
-- Users can SUBMIT memories for their church
-- Admins can UPDATE (approve/reject) memories

CREATE POLICY "Anyone can view approved memories" ON trip_memories
    FOR SELECT USING (status = 'approved');  -- Only approved memories are public

CREATE POLICY "Users can submit memories for their church" ON trip_memories
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = trip_memories.church_id
        )
    );

CREATE POLICY "Admins can manage memories" ON trip_memories
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.church_id = trip_memories.church_id
            AND users.role = 'admin'
        )
    );

-- ==================== Verify the Changes ====================
-- Run these to confirm:
-- SELECT COUNT(*) FROM events WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;
-- SELECT COUNT(*) FROM resources WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;
-- SELECT COUNT(*) FROM faqs WHERE church_id = '00000000-0000-0000-0000-000000000001'::uuid;

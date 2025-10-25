-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to remove problematic admin-checking policies

-- Drop all RLS policies that reference the users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payment config" ON payment_config;
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage all memories" ON trip_memories;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;
DROP POLICY IF EXISTS "Admins can view all questions" ON user_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON user_questions;
DROP POLICY IF EXISTS "Admins can manage responses" ON question_responses;
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
DROP POLICY IF EXISTS "Admins can manage content items" ON content_items;

-- Now you can use your app with the basic RLS policies
-- Admin functionality will be handled at the application level instead of database level
-- This is acceptable for private/limited access applications like yours

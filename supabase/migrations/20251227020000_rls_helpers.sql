-- ============================================
-- RLS Helper Functions
-- ============================================
-- Reference: PHASE-1-FOUNDATION.md Section 1.3.2
-- Purpose: Create helper functions for Row Level Security policies
-- Author: Huỳnh Sang
-- Date: 2025-12-27
--
-- Functions:
-- 1. is_admin() - Check if current user is admin
-- 2. is_author(author_id) - Check if current user is the author

-- ============================================
-- Function: is_admin()
-- ============================================
-- Returns TRUE if the current authenticated user has 'admin' role
-- Used in RLS policies to grant full access to admin users
-- SECURITY DEFINER: Runs with elevated privileges to access profiles table

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated and has admin role
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Check if current user has admin role';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- Function: is_author(author_id UUID)
-- ============================================
-- Returns TRUE if the current authenticated user is the author
-- Used in RLS policies to allow authors to manage their own content
-- SECURITY DEFINER: Runs with elevated privileges

CREATE OR REPLACE FUNCTION public.is_author(author_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple check: is the current user the author?
  RETURN auth.uid() = author_id;
END;
$$;

COMMENT ON FUNCTION public.is_author(UUID) IS 'Check if current user is the author of content';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_author(UUID) TO authenticated;

-- ============================================
-- Verification
-- ============================================
-- Run these commands to verify helper functions:
--
-- List all functions:
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN ('is_admin', 'is_author');
--
-- Test is_admin() (as authenticated user):
-- SELECT is_admin();
--
-- Test is_author() (as authenticated user):
-- SELECT is_author('some-uuid-here');

-- ============================================
-- Notes
-- ============================================
-- 1. SECURITY DEFINER: Functions run with privileges of the function owner
--    This allows RLS policies to query profiles table even when RLS is enabled
--
-- 2. SET search_path = public: Prevents schema injection attacks
--
-- 3. GRANT EXECUTE: Allows authenticated users to call these functions
--    Anonymous users cannot execute these functions
--
-- 4. Usage in RLS policies:
--    CREATE POLICY "Admin full access"
--      ON blog_posts FOR ALL
--      USING (is_admin());
--
--    CREATE POLICY "Authors can edit own posts"
--      ON blog_posts FOR UPDATE
--      USING (is_author(author_id));

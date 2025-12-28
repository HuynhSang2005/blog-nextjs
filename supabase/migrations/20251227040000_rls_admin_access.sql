-- ============================================
-- Admin Full Access RLS Policies
-- ============================================
-- Reference: PHASE-1-FOUNDATION.md Section 1.3.4
-- Purpose: Grant full CRUD access to admin users
-- Author: Huỳnh Sang
-- Date: 2025-12-27
--
-- Strategy:
-- - Admin users (role='admin') can perform all operations
-- - Uses is_admin() helper function for policy checks
-- - FOR ALL applies to SELECT, INSERT, UPDATE, DELETE

-- ============================================
-- PROFILES: Admin full access
-- ============================================
CREATE POLICY "Admin full access profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access profiles" ON public.profiles IS 
  'Admin users have full CRUD access to all profiles';

-- ============================================
-- MEDIA: Admin full access
-- ============================================
CREATE POLICY "Admin full access media"
  ON public.media
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access media" ON public.media IS 
  'Admin users can upload, update, delete media';

-- ============================================
-- TAGS: Admin full access
-- ============================================
CREATE POLICY "Admin full access tags"
  ON public.tags
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access tags" ON public.tags IS 
  'Admin users can create, update, delete tags';

-- ============================================
-- BLOG_POSTS: Admin full access
-- ============================================
CREATE POLICY "Admin full access blog posts"
  ON public.blog_posts
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access blog posts" ON public.blog_posts IS 
  'Admin users can create, edit, publish, delete blog posts';

-- ============================================
-- BLOG_POST_TAGS: Admin full access
-- ============================================
CREATE POLICY "Admin full access blog post tags"
  ON public.blog_post_tags
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access blog post tags" ON public.blog_post_tags IS 
  'Admin users can manage blog post tags';

-- ============================================
-- PROJECTS: Admin full access
-- ============================================
CREATE POLICY "Admin full access projects"
  ON public.projects
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access projects" ON public.projects IS 
  'Admin users can create, update, delete projects';

-- ============================================
-- PROJECT_MEDIA: Admin full access
-- ============================================
CREATE POLICY "Admin full access project media"
  ON public.project_media
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access project media" ON public.project_media IS 
  'Admin users can manage project gallery images';

-- ============================================
-- PROJECT_TAGS: Admin full access
-- ============================================
CREATE POLICY "Admin full access project tags"
  ON public.project_tags
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access project tags" ON public.project_tags IS 
  'Admin users can manage project tags';

-- ============================================
-- PROJECT_TECH_STACK: Admin full access
-- ============================================
CREATE POLICY "Admin full access project tech stack"
  ON public.project_tech_stack
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access project tech stack" ON public.project_tech_stack IS 
  'Admin users can manage project technologies';

-- ============================================
-- DOCS_TOPICS: Admin full access
-- ============================================
CREATE POLICY "Admin full access docs topics"
  ON public.docs_topics
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access docs topics" ON public.docs_topics IS 
  'Admin users can create, update, delete documentation topics';

-- ============================================
-- ABOUT_SECTIONS: Admin full access
-- ============================================
CREATE POLICY "Admin full access about sections"
  ON public.about_sections
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access about sections" ON public.about_sections IS 
  'Admin users can manage about page sections';

-- ============================================
-- TIMELINE_EVENTS: Admin full access
-- ============================================
CREATE POLICY "Admin full access timeline events"
  ON public.timeline_events
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access timeline events" ON public.timeline_events IS 
  'Admin users can manage career timeline events';

-- ============================================
-- SKILLS: Admin full access
-- ============================================
CREATE POLICY "Admin full access skills"
  ON public.skills
  FOR ALL
  USING (public.is_admin());

COMMENT ON POLICY "Admin full access skills" ON public.skills IS 
  'Admin users can add, update, delete skills';

-- ============================================
-- Verification
-- ============================================
-- List all policies:
-- SELECT tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- Count policies per table (should be 2 each now: public read + admin full):
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;
--
-- View specific policy details:
-- SELECT *
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND policyname LIKE '%Admin%';

-- ============================================
-- Summary
-- ============================================
-- Admin full access policies created for 13 tables:
-- 1. profiles - admin can manage all user profiles
-- 2. media - admin can upload/delete media
-- 3. tags - admin can create/edit tags
-- 4. blog_posts - admin can create/edit/publish/delete posts
-- 5. blog_post_tags - admin can assign tags
-- 6. projects - admin can manage all projects
-- 7. project_media - admin can manage project galleries
-- 8. project_tags - admin can assign project tags
-- 9. project_tech_stack - admin can manage tech stack
-- 10. docs_topics - admin can create documentation topics
-- 11. about_sections - admin can edit about page
-- 12. timeline_events - admin can update timeline
-- 13. skills - admin can manage skills list
--
-- Total policies now: 26 (13 public read + 13 admin full access)

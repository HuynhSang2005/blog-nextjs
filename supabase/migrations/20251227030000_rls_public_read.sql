-- ============================================
-- Public Read RLS Policies
-- ============================================
-- Reference: PHASE-1-FOUNDATION.md Section 1.3.3
-- Purpose: Allow anonymous/authenticated users to read published content
-- Author: Huỳnh Sang
-- Date: 2025-12-27
--
-- Strategy:
-- - Public can SELECT published blog posts, projects
-- - Public can SELECT all media, tags, skills
-- - Public can SELECT profiles (limited fields)
-- - Junction tables inherit parent policies

-- ============================================
-- PROFILES: Public read (limited fields via view or SELECT)
-- ============================================
CREATE POLICY "Public read profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read profiles" ON public.profiles IS 
  'Allow public to read user profiles for author info';

-- ============================================
-- MEDIA: Public read all (Cloudinary CDN files)
-- ============================================
CREATE POLICY "Public read media"
  ON public.media
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read media" ON public.media IS 
  'Allow public to read media metadata (files served via Cloudinary CDN)';

-- ============================================
-- TAGS: Public read all
-- ============================================
CREATE POLICY "Public read tags"
  ON public.tags
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read tags" ON public.tags IS 
  'Allow public to read all tags for filtering content';

-- ============================================
-- BLOG_POSTS: Public read published only
-- ============================================
CREATE POLICY "Public read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

COMMENT ON POLICY "Public read published blog posts" ON public.blog_posts IS 
  'Allow public to read only published blog posts';

-- ============================================
-- BLOG_POST_TAGS: Public read (junction table)
-- ============================================
CREATE POLICY "Public read blog post tags"
  ON public.blog_post_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE blog_posts.id = blog_post_tags.blog_post_id
        AND blog_posts.status = 'published'
    )
  );

COMMENT ON POLICY "Public read blog post tags" ON public.blog_post_tags IS 
  'Allow public to read tags for published blog posts only';

-- ============================================
-- PROJECTS: Public read completed/in-progress
-- ============================================
CREATE POLICY "Public read visible projects"
  ON public.projects
  FOR SELECT
  USING (
    status IN ('completed', 'in_progress')
    -- Optionally add: OR (status = 'archived' AND featured = true)
  );

COMMENT ON POLICY "Public read visible projects" ON public.projects IS 
  'Allow public to read completed and in-progress projects';

-- ============================================
-- PROJECT_MEDIA: Public read (gallery images)
-- ============================================
CREATE POLICY "Public read project media"
  ON public.project_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_media.project_id
        AND projects.status IN ('completed', 'in_progress')
    )
  );

COMMENT ON POLICY "Public read project media" ON public.project_media IS 
  'Allow public to read media for visible projects';

-- ============================================
-- PROJECT_TAGS: Public read (junction table)
-- ============================================
CREATE POLICY "Public read project tags"
  ON public.project_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_tags.project_id
        AND projects.status IN ('completed', 'in_progress')
    )
  );

COMMENT ON POLICY "Public read project tags" ON public.project_tags IS 
  'Allow public to read tags for visible projects';

-- ============================================
-- PROJECT_TECH_STACK: Public read
-- ============================================
CREATE POLICY "Public read project tech stack"
  ON public.project_tech_stack
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_tech_stack.project_id
        AND projects.status IN ('completed', 'in_progress')
    )
  );

COMMENT ON POLICY "Public read project tech stack" ON public.project_tech_stack IS 
  'Allow public to read tech stack for visible projects';

-- ============================================
-- DOCS_TOPICS: Public read all
-- ============================================
CREATE POLICY "Public read docs topics"
  ON public.docs_topics
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read docs topics" ON public.docs_topics IS 
  'Allow public to read all documentation topics';

-- ============================================
-- ABOUT_SECTIONS: Public read visible only
-- ============================================
CREATE POLICY "Public read visible about sections"
  ON public.about_sections
  FOR SELECT
  USING (visible = true);

COMMENT ON POLICY "Public read visible about sections" ON public.about_sections IS 
  'Allow public to read visible about page sections';

-- ============================================
-- TIMELINE_EVENTS: Public read all
-- ============================================
CREATE POLICY "Public read timeline events"
  ON public.timeline_events
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read timeline events" ON public.timeline_events IS 
  'Allow public to read career/education timeline';

-- ============================================
-- SKILLS: Public read all
-- ============================================
CREATE POLICY "Public read skills"
  ON public.skills
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read skills" ON public.skills IS 
  'Allow public to read all technical skills';

-- ============================================
-- Verification
-- ============================================
-- List all policies:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- Count policies per table:
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;

-- ============================================
-- Summary
-- ============================================
-- Policies created for 13 tables:
-- 1. profiles - public read all
-- 2. media - public read all
-- 3. tags - public read all
-- 4. blog_posts - public read published only
-- 5. blog_post_tags - public read for published posts
-- 6. projects - public read completed/in_progress
-- 7. project_media - public read for visible projects
-- 8. project_tags - public read for visible projects
-- 9. project_tech_stack - public read for visible projects
-- 10. docs_topics - public read all
-- 11. about_sections - public read visible only
-- 12. timeline_events - public read all
-- 13. skills - public read all

-- ============================================
-- Dev Refactor v4 - Phase 1.1: Composite Indexes
-- Task: DB-INDEX-001
-- Created: 2026-01-10
-- Purpose: Optimize query performance for common filter patterns
-- ============================================

-- 1. idx_blog_posts_status_published
-- Optimize: Blog listing with status filter + date ordering
-- Query pattern: SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC
-- Note: Existing idx_blog_posts_published_listing is partial (WHERE status = 'published')
-- This new index covers ALL statuses with published date ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_status_published 
ON blog_posts(status, published_at DESC);

COMMENT ON INDEX idx_blog_posts_status_published IS 'Optimizes blog_posts filtering by status and date ordering';

-- 2. idx_blog_posts_author_published
-- Optimize: Author archive page queries
-- Query pattern: SELECT * FROM blog_posts WHERE author_id = 'uuid' ORDER BY published_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_author_published 
ON blog_posts(author_id, published_at DESC);

COMMENT ON INDEX idx_blog_posts_author_published IS 'Optimizes author archive queries filtering by author_id and date';

-- 3. idx_docs_topic_order_locale
-- Optimize: Docs navigation with topic filtering
-- Query pattern: SELECT * FROM docs WHERE topic_id = 'uuid' AND locale = 'vi' ORDER BY order_index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_docs_topic_order_locale 
ON docs(topic_id, order_index, locale);

COMMENT ON INDEX idx_docs_topic_order_locale IS 'Optimizes docs navigation by topic, order, and locale';

-- 4. idx_projects_featured_sort
-- Optimize: Featured projects listing
-- Query pattern: SELECT * FROM projects WHERE featured = true ORDER BY order_index
-- Note: Existing idx_projects_featured_listing is partial (WHERE featured = true AND locale/order_index)
-- This new index is simpler and covers the featured sorting pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_featured_sort 
ON projects(featured, order_index);

COMMENT ON INDEX idx_projects_featured_sort IS 'Optimizes featured projects ordering by order_index';

-- ============================================
-- Verification queries (run after migration)
-- ============================================

-- Analyze tables to update statistics
ANALYZE blog_posts;
ANALYZE docs;
ANALYZE projects;

-- Verify indexes are being used
-- EXPLAIN ANALYZE SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 10;
-- EXPLAIN ANALYZE SELECT * FROM blog_posts WHERE author_id = 'test-id' ORDER BY published_at DESC LIMIT 10;
-- EXPLAIN ANALYZE SELECT * FROM docs WHERE topic_id = 'test-id' AND locale = 'vi' ORDER BY order_index;
-- EXPLAIN ANALYZE SELECT * FROM projects WHERE featured = true ORDER BY sort_order;

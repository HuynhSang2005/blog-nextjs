-- ============================================
-- MDX PRECOMPUTE FIELDS - Phase 1.3A
-- ============================================
-- Adds precomputed artifacts for MDX content to improve runtime performance
-- Based on Phase 0 baseline analysis: https://github.com/HuynhSang2005/blog-nextjs/blob/main/docs/dev-mdx/phase-0-mdx-baseline.md
--
-- Key optimization: precompute TOC, reading time, search text, and content hash at publish-time
-- to avoid expensive runtime computations (remark parsing, AST walks, etc.)

-- ============================================
-- DOCS TABLE
-- ============================================
-- Docs pages have the highest TOC computation cost (Hotspot #2)

ALTER TABLE docs ADD COLUMN IF NOT EXISTS toc JSONB;
COMMENT ON COLUMN docs.toc IS 'Precomputed Table of Contents (array of {id, depth, value}) - avoids runtime remark parsing';

ALTER TABLE docs ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
COMMENT ON COLUMN docs.reading_time_minutes IS 'Estimated reading time (word count / 200 WPM)';

ALTER TABLE docs ADD COLUMN IF NOT EXISTS search_text TEXT;
COMMENT ON COLUMN docs.search_text IS 'Plain text stripped from MDX for full-text search';

ALTER TABLE docs ADD COLUMN IF NOT EXISTS content_hash TEXT;
COMMENT ON COLUMN docs.content_hash IS 'SHA-256 hash of content for cache invalidation';

-- Update full-text search index to use precomputed search_text (when available)
DROP INDEX IF EXISTS idx_docs_search;
CREATE INDEX idx_docs_search ON docs 
  USING gin(to_tsvector('english', 
    title || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(search_text, content)  -- Fallback to content if search_text is NULL
  ));

-- ============================================
-- BLOG_POSTS TABLE
-- ============================================
-- Blog posts already have read_time_minutes, rename to reading_time_minutes for consistency

-- Rename existing column (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'read_time_minutes'
  ) THEN
    ALTER TABLE blog_posts RENAME COLUMN read_time_minutes TO reading_time_minutes;
  ELSE
    -- Add if doesn't exist (shouldn't happen, but defensive)
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
  END IF;
END $$;

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS search_text TEXT;
COMMENT ON COLUMN blog_posts.search_text IS 'Plain text stripped from MDX for full-text search';

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_hash TEXT;
COMMENT ON COLUMN blog_posts.content_hash IS 'SHA-256 hash of content for cache invalidation';

-- Update full-text search index to use precomputed search_text (when available)
DROP INDEX IF EXISTS idx_blog_posts_search_vector;
CREATE INDEX idx_blog_posts_search ON blog_posts 
  USING gin(to_tsvector('english', 
    title || ' ' || 
    COALESCE(excerpt, '') || ' ' || 
    COALESCE(search_text, content)  -- Fallback to content if search_text is NULL
  ));

-- ============================================
-- PROJECTS TABLE
-- ============================================
-- Projects use long_description field (MDX format)

ALTER TABLE projects ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
COMMENT ON COLUMN projects.reading_time_minutes IS 'Estimated reading time for long_description (word count / 200 WPM)';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_text TEXT;
COMMENT ON COLUMN projects.search_text IS 'Plain text stripped from long_description for full-text search';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS content_hash TEXT;
COMMENT ON COLUMN projects.content_hash IS 'SHA-256 hash of long_description for cache invalidation';

-- Update full-text search (drop existing generated column, use index instead)
-- Note: projects table already has search_vector as generated column - we'll keep it for now
-- but add new index with precomputed search_text
CREATE INDEX IF NOT EXISTS idx_projects_search_precomputed ON projects 
  USING gin(to_tsvector('english', 
    title || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(search_text, long_description)  -- Fallback to long_description if search_text is NULL
  ));

-- ============================================
-- VALIDATION
-- ============================================
-- Verify all columns added successfully
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  -- Check docs columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docs' AND column_name = 'toc') THEN
    missing_columns := array_append(missing_columns, 'docs.toc');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docs' AND column_name = 'reading_time_minutes') THEN
    missing_columns := array_append(missing_columns, 'docs.reading_time_minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docs' AND column_name = 'search_text') THEN
    missing_columns := array_append(missing_columns, 'docs.search_text');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docs' AND column_name = 'content_hash') THEN
    missing_columns := array_append(missing_columns, 'docs.content_hash');
  END IF;

  -- Check blog_posts columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'reading_time_minutes') THEN
    missing_columns := array_append(missing_columns, 'blog_posts.reading_time_minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'search_text') THEN
    missing_columns := array_append(missing_columns, 'blog_posts.search_text');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'content_hash') THEN
    missing_columns := array_append(missing_columns, 'blog_posts.content_hash');
  END IF;

  -- Check projects columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'reading_time_minutes') THEN
    missing_columns := array_append(missing_columns, 'projects.reading_time_minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'search_text') THEN
    missing_columns := array_append(missing_columns, 'projects.search_text');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'content_hash') THEN
    missing_columns := array_append(missing_columns, 'projects.content_hash');
  END IF;

  -- Report missing columns
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration validation failed. Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Migration validation passed. All precompute fields added successfully.';
  END IF;
END $$;

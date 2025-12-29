-- ============================================
-- DOCS TABLE - Phase 1 Critical Path Implementation
-- ============================================
-- Creates the docs table for storing documentation pages
-- Grouped by topics (references docs_topics table)
-- Supports nested structure via self-referential FK
-- Full-text search enabled on title, description, content

CREATE TABLE IF NOT EXISTS docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES docs_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'vi',
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES docs(id) ON DELETE CASCADE, -- For nested docs
  show_toc BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, slug, locale)
);

COMMENT ON TABLE docs IS 'Documentation pages grouped by topics';
COMMENT ON COLUMN docs.topic_id IS 'References docs_topics table - categorizes doc into topics';
COMMENT ON COLUMN docs.parent_id IS 'Parent doc for nested structure (self-referential)';
COMMENT ON COLUMN docs.content IS 'MDX/HTML content stored as TEXT';
COMMENT ON COLUMN docs.show_toc IS 'Whether to show table of contents in sidebar';

-- Indexes for performance
CREATE INDEX idx_docs_slug ON docs(slug);
CREATE INDEX idx_docs_topic ON docs(topic_id);
CREATE INDEX idx_docs_locale ON docs(locale);
CREATE INDEX idx_docs_parent ON docs(parent_id);
CREATE INDEX idx_docs_order ON docs(order_index);

-- Full-text search index
CREATE INDEX idx_docs_search ON docs 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content));

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

-- Public read access for all docs
CREATE POLICY "Public read access"
  ON docs FOR SELECT
  USING (true);

-- Admin full access (insert, update, delete)
CREATE POLICY "Admin full access"
  ON docs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER docs_updated_at_trigger
  BEFORE UPDATE ON docs
  FOR EACH ROW
  EXECUTE FUNCTION update_docs_updated_at();

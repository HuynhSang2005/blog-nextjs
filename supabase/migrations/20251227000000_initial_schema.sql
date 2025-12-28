-- ============================================
-- MIGRATION: Initial Database Schema
-- ============================================
-- Description: Tạo schema ban đầu cho Blog-Portfolio platform
--              bao gồm: profiles, media, blog_posts, projects,
--              và các bảng hỗ trợ khác
-- Date: 2025-12-27
-- Author: Huỳnh Sang
-- Reference: docs/dev-v1/database-schema-cloudinary.md
-- ============================================

-- Note: Schema sẽ được thêm vào từng phần trong các task tiếp theo
-- Task 1.2.2: profiles, media tables ✅
-- Task 1.2.3: blog_posts, blog_tags, blog_post_tags tables ✅
-- Task 1.2.4: projects, project_media, project_tags, project_tech_stack tables ✅
-- Task 1.2.5: docs_topics, about_sections, timeline_events, skills tables ✅

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'admin')),
  full_name TEXT,
  avatar_media_id UUID, -- Will reference media(id) after media table is created
  bio TEXT,
  email TEXT UNIQUE,
  github_username TEXT,
  twitter_username TEXT,
  linkedin_username TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON COLUMN profiles.role IS 'User role: guest (default) or admin';
COMMENT ON COLUMN profiles.avatar_media_id IS 'Profile avatar (Cloudinary reference)';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'guest',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- MEDIA TABLE (Cloudinary References)
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cloudinary identifiers
  public_id TEXT UNIQUE NOT NULL,  -- e.g., 'blog/covers/nextjs-guide'
  version INTEGER NOT NULL,         -- Cloudinary version number
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video', 'raw')),
  format TEXT,                      -- e.g., 'jpg', 'png', 'mp4'
  
  -- Media metadata
  width INTEGER,
  height INTEGER,
  bytes BIGINT,                     -- File size in bytes
  duration NUMERIC,                 -- Video duration in seconds
  
  -- Descriptive info
  alt_text TEXT,
  caption TEXT,
  
  -- Organization
  folder TEXT,                      -- Cloudinary folder path
  tags TEXT[],                      -- Cloudinary tags for organization
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Additional metadata (JSON)
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE media IS 'Metadata for media files stored in Cloudinary';
COMMENT ON COLUMN media.public_id IS 'Cloudinary public_id (unique identifier)';
COMMENT ON COLUMN media.version IS 'Cloudinary version number for cache busting';
COMMENT ON COLUMN media.metadata IS 'Additional Cloudinary metadata (colors, phash, etc.)';

-- Indexes
CREATE INDEX idx_media_public_id ON media(public_id);
CREATE INDEX idx_media_resource_type ON media(resource_type);
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_tags ON media USING gin(tags);
CREATE INDEX idx_media_uploaded_at ON media(uploaded_at DESC);

-- Full-text search on alt_text and caption
CREATE INDEX idx_media_search ON media USING gin(
  to_tsvector('english', COALESCE(alt_text, '') || ' ' || COALESCE(caption, ''))
);

-- Now add foreign key constraint for profiles.avatar_media_id
ALTER TABLE profiles 
  ADD CONSTRAINT fk_profiles_avatar_media 
  FOREIGN KEY (avatar_media_id) 
  REFERENCES media(id) 
  ON DELETE SET NULL;

CREATE INDEX idx_profiles_avatar ON profiles(avatar_media_id);

-- ============================================
-- TAGS TABLE (Reusable for Blog & Projects)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT, -- Hex color for UI (e.g., #3178C6)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Reusable tags for blog posts and projects';

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- MDX content
  cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL, -- Cloudinary cover image
  og_media_id UUID REFERENCES media(id) ON DELETE SET NULL, -- Cloudinary OG image
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  locale TEXT NOT NULL DEFAULT 'vi',
  featured BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  meta_description TEXT,
  read_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,
  series_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL, -- For series
  series_order INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, locale)
);

COMMENT ON TABLE blog_posts IS 'Blog post content stored in database';
COMMENT ON COLUMN blog_posts.status IS 'Publication status: draft, published, archived';
COMMENT ON COLUMN blog_posts.series_id IS 'Parent post if part of a series';
COMMENT ON COLUMN blog_posts.cover_media_id IS 'Cover image from Cloudinary (media table)';
COMMENT ON COLUMN blog_posts.og_media_id IS 'Open Graph image from Cloudinary (media table)';
COMMENT ON COLUMN blog_posts.content IS 'MDX content stored as text';

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured) WHERE featured = TRUE;
CREATE INDEX idx_blog_posts_series ON blog_posts(series_id);
CREATE INDEX idx_blog_posts_cover_media ON blog_posts(cover_media_id);
CREATE INDEX idx_blog_posts_og_media ON blog_posts(og_media_id);

-- Full-text search index
CREATE INDEX idx_blog_posts_search ON blog_posts 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- ============================================
-- BLOG POST TAGS (Junction Table)
-- ============================================
CREATE TABLE blog_post_tags (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blog_post_id, tag_id)
);

COMMENT ON TABLE blog_post_tags IS 'Many-to-many relationship between blog posts and tags';

CREATE INDEX idx_blog_post_tags_post ON blog_post_tags(blog_post_id);
CREATE INDEX idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT, -- Short description (excerpt)
  long_description TEXT, -- Full MDX content
  cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL, -- Main thumbnail
  og_media_id UUID REFERENCES media(id) ON DELETE SET NULL, -- Open Graph image
  demo_url TEXT, -- Live demo URL
  github_url TEXT, -- Source code URL
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  locale TEXT NOT NULL DEFAULT 'vi',
  order_index INTEGER DEFAULT 0, -- For manual ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, locale)
);

COMMENT ON TABLE projects IS 'Portfolio projects';
COMMENT ON COLUMN projects.cover_media_id IS 'Main project thumbnail (Cloudinary)';
COMMENT ON COLUMN projects.og_media_id IS 'Open Graph image (Cloudinary)';
COMMENT ON COLUMN projects.long_description IS 'Full project description in MDX format';
COMMENT ON COLUMN projects.order_index IS 'Manual ordering for projects list';

-- Indexes
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = TRUE;
CREATE INDEX idx_projects_locale ON projects(locale);
CREATE INDEX idx_projects_order ON projects(order_index);
CREATE INDEX idx_projects_cover_media ON projects(cover_media_id);
CREATE INDEX idx_projects_og_media ON projects(og_media_id);

-- Full-text search
CREATE INDEX idx_projects_search ON projects 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(long_description, '')));

-- ============================================
-- PROJECT MEDIA (Gallery Junction Table)
-- ============================================
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0, -- For gallery ordering
  caption TEXT, -- Optional caption for this media in gallery
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, media_id)
);

COMMENT ON TABLE project_media IS 'Gallery media for projects (many-to-many)';
COMMENT ON COLUMN project_media.order_index IS 'Display order in project gallery';

-- Indexes
CREATE INDEX idx_project_media_project ON project_media(project_id);
CREATE INDEX idx_project_media_order ON project_media(project_id, order_index);

-- ============================================
-- PROJECT TAGS (Junction Table)
-- ============================================
CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

COMMENT ON TABLE project_tags IS 'Many-to-many relationship between projects and tags';

CREATE INDEX idx_project_tags_project ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag ON project_tags(tag_id);

-- ============================================
-- PROJECT TECH STACK TABLE
-- ============================================
CREATE TABLE project_tech_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Next.js", "TypeScript"
  category TEXT CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'tools', 'other')),
  icon TEXT, -- Lucide icon name or custom icon URL
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE project_tech_stack IS 'Technologies used in each project';
COMMENT ON COLUMN project_tech_stack.icon IS 'Lucide icon name (e.g., "react") or custom icon URL';

CREATE INDEX idx_project_tech_stack_project ON project_tech_stack(project_id);
CREATE INDEX idx_project_tech_stack_order ON project_tech_stack(project_id, order_index);
-- ============================================
-- DOCS TOPICS TABLE (Documentation Categories)
-- ============================================
CREATE TABLE docs_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name (e.g., "book", "code")
  color TEXT, -- Hex color for UI (e.g., #3178C6)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE docs_topics IS 'Documentation topic categories (Next.js, React, TypeScript, etc.)';
COMMENT ON COLUMN docs_topics.icon IS 'Lucide icon name for visual representation';
COMMENT ON COLUMN docs_topics.order_index IS 'Display order in docs navigation';

-- Indexes
CREATE INDEX idx_docs_topics_slug ON docs_topics(slug);
CREATE INDEX idx_docs_topics_order ON docs_topics(order_index);

-- ============================================
-- ABOUT SECTIONS TABLE (Configurable About Page)
-- ============================================
CREATE TABLE about_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL, -- e.g., 'bio', 'education', 'experience', 'contact'
  title TEXT NOT NULL,
  content TEXT, -- MDX content
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  locale TEXT NOT NULL DEFAULT 'vi',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_key, locale)
);

COMMENT ON TABLE about_sections IS 'Configurable sections for about page';
COMMENT ON COLUMN about_sections.section_key IS 'Unique identifier for section type';
COMMENT ON COLUMN about_sections.content IS 'MDX content for flexible formatting';
COMMENT ON COLUMN about_sections.visible IS 'Toggle section visibility without deleting';

-- Indexes
CREATE INDEX idx_about_sections_key ON about_sections(section_key);
CREATE INDEX idx_about_sections_order ON about_sections(order_index);
CREATE INDEX idx_about_sections_locale ON about_sections(locale);
CREATE INDEX idx_about_sections_visible ON about_sections(visible) WHERE visible = TRUE;

-- ============================================
-- TIMELINE EVENTS TABLE (Career & Education)
-- ============================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT, -- e.g., Company name, University name
  description TEXT, -- MDX content for rich descriptions
  event_type TEXT NOT NULL CHECK (event_type IN ('education', 'work', 'achievement', 'other')),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL if is_current = TRUE
  is_current BOOLEAN DEFAULT FALSE, -- Currently ongoing (e.g., current job)
  icon TEXT, -- Lucide icon name (e.g., "briefcase", "graduation-cap")
  media_id UUID REFERENCES media(id) ON DELETE SET NULL, -- Optional image/video
  locale TEXT NOT NULL DEFAULT 'vi',
  order_index INTEGER DEFAULT 0, -- Manual ordering override (lower = higher priority)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE timeline_events IS 'Career, education, and achievement timeline for about page';
COMMENT ON COLUMN timeline_events.subtitle IS 'Organization name (company, university, etc.)';
COMMENT ON COLUMN timeline_events.is_current IS 'TRUE for ongoing events (current job, etc.)';
COMMENT ON COLUMN timeline_events.media_id IS 'Optional image/logo from Cloudinary';
COMMENT ON COLUMN timeline_events.order_index IS 'Manual override for display order (default: sort by start_date DESC)';

-- Indexes
CREATE INDEX idx_timeline_events_date ON timeline_events(start_date DESC);
CREATE INDEX idx_timeline_events_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_events_order ON timeline_events(order_index);
CREATE INDEX idx_timeline_events_locale ON timeline_events(locale);
CREATE INDEX idx_timeline_events_media ON timeline_events(media_id);
CREATE INDEX idx_timeline_events_current ON timeline_events(is_current) WHERE is_current = TRUE;

-- ============================================
-- SKILLS TABLE (Technical & Soft Skills)
-- ============================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'tools', 'soft_skills', 'other')),
  proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100), -- Percentage (0-100)
  icon TEXT, -- Lucide icon name or custom icon identifier
  color TEXT, -- Hex color for visual representation
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE skills IS 'Technical and soft skills for about page and resume';
COMMENT ON COLUMN skills.proficiency IS 'Skill proficiency as percentage (0-100)';
COMMENT ON COLUMN skills.icon IS 'Lucide icon name (e.g., "react") or custom icon';
COMMENT ON COLUMN skills.color IS 'Hex color for skill badge (e.g., #61DAFB for React)';

-- Indexes
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_order ON skills(order_index);
CREATE INDEX idx_skills_proficiency ON skills(proficiency DESC);

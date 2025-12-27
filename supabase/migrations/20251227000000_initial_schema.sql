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
-- Task 1.2.3: blog_posts, blog_tags, blog_post_tags tables
-- Task 1.2.4: projects, project_media, project_tags, project_tech_stack tables
-- Task 1.2.5: docs_topics, about_sections, timeline_events, skills tables

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


-- ============================================
-- MIGRATION: Enable Row Level Security (RLS)
-- ============================================
-- Description: Enable RLS on all tables for security
-- Date: 2025-12-27
-- Author: Huỳnh Sang
-- Reference: docs/dev-v1/PHASE-1-FOUNDATION.md#task-13
-- ============================================

-- Enable RLS on all tables
-- This ensures that all data access is controlled by policies

-- ============================================
-- CORE TABLES
-- ============================================

-- profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- media table (Cloudinary metadata)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- tags table (shared for blog & projects)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BLOG TABLES
-- ============================================

-- blog_posts table
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- blog_post_tags junction table
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECT TABLES
-- ============================================

-- projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- project_media junction table
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

-- project_tags junction table
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- project_tech_stack table
ALTER TABLE project_tech_stack ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PORTFOLIO/ABOUT TABLES
-- ============================================

-- docs_topics table
ALTER TABLE docs_topics ENABLE ROW LEVEL SECURITY;

-- about_sections table
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- timeline_events table
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- skills table
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- All 13 tables now have RLS enabled:
-- ✅ profiles
-- ✅ media
-- ✅ tags
-- ✅ blog_posts
-- ✅ blog_post_tags
-- ✅ projects
-- ✅ project_media
-- ✅ project_tags
-- ✅ project_tech_stack
-- ✅ docs_topics
-- ✅ about_sections
-- ✅ timeline_events
-- ✅ skills

-- Note: No policies yet - all access will be DENIED until policies are created
-- This is intentional for security - explicit allow, not explicit deny

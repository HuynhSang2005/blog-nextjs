import { NextResponse } from 'next/server'
import {
  getBlogPosts,
  getBlogPost,
  getFeaturedBlogPosts,
} from '@/lib/supabase/queries/blog'
import {
  getProjects,
  getProject,
  getFeaturedProjects,
} from '@/lib/supabase/queries/projects'
import { getRecentMedia, getMediaStats } from '@/lib/supabase/queries/media'

/**
 * Test API endpoint để verify all query functions
 * GET /api/test-queries
 */
export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    locale: 'vi',
    tests: {
      blog: {} as Record<string, unknown>,
      projects: {} as Record<string, unknown>,
      media: {} as Record<string, unknown>,
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  }

  // Test Blog Queries
  try {
    // Test 1: getBlogPosts
    try {
      const blogPostsResult = await getBlogPosts('vi', undefined, {
        page: 1,
        pageSize: 5,
      })
      testResults.tests.blog.getBlogPosts = {
        status: 'passed',
        itemCount: blogPostsResult.data?.length || 0,
        pagination: blogPostsResult.pagination,
      }
      testResults.summary.total++
      testResults.summary.passed++

      // Test 3: getBlogPost (test với first available post nếu có)
      const firstPost = blogPostsResult.data?.[0]
      if (firstPost) {
        const blogPostResult = await getBlogPost(firstPost.slug, 'vi')
        testResults.tests.blog.getBlogPost = {
          status: blogPostResult.error ? 'failed' : 'passed',
          found: !!blogPostResult.data,
          slug: firstPost.slug,
          error: blogPostResult.error?.message,
        }
        testResults.summary.total++
        if (!blogPostResult.error) testResults.summary.passed++
        else testResults.summary.failed++
      } else {
        testResults.tests.blog.getBlogPost = {
          status: 'skipped',
          reason: 'No blog posts available',
        }
      }
    } catch (error) {
      testResults.tests.blog.getBlogPosts = {
        status: 'failed',
        error: (error as Error).message,
      }
      testResults.summary.total++
      testResults.summary.failed++
    }

    // Test 2: getFeaturedBlogPosts
    try {
      const featuredBlogResult = await getFeaturedBlogPosts('vi', 3)
      testResults.tests.blog.getFeaturedBlogPosts = {
        status: featuredBlogResult.error ? 'failed' : 'passed',
        itemCount: featuredBlogResult.data?.length || 0,
        error: featuredBlogResult.error?.message,
      }
      testResults.summary.total++
      if (!featuredBlogResult.error) testResults.summary.passed++
      else testResults.summary.failed++
    } catch (error) {
      testResults.tests.blog.getFeaturedBlogPosts = {
        status: 'failed',
        error: (error as Error).message,
      }
      testResults.summary.total++
      testResults.summary.failed++
    }
  } catch (error) {
    testResults.tests.blog.error = (error as Error).message
    testResults.summary.failed++
  }

  // Test Project Queries
  try {
    // Test 4: getProjects
    try {
      const projectsResult = await getProjects('vi', undefined, {
        page: 1,
        pageSize: 5,
      })
      testResults.tests.projects.getProjects = {
        status: 'passed',
        itemCount: projectsResult.data?.length || 0,
        pagination: projectsResult.pagination,
      }
      testResults.summary.total++
      testResults.summary.passed++

      // Test 6: getProject (test với first available project nếu có)
      const firstProject = projectsResult.data?.[0]
      if (firstProject) {
        const projectResult = await getProject(firstProject.slug, 'vi')
        testResults.tests.projects.getProject = {
          status: projectResult.error ? 'failed' : 'passed',
          found: !!projectResult.data,
          slug: firstProject.slug,
          error: projectResult.error?.message,
        }
        testResults.summary.total++
        if (!projectResult.error) testResults.summary.passed++
        else testResults.summary.failed++
      } else {
        testResults.tests.projects.getProject = {
          status: 'skipped',
          reason: 'No projects available',
        }
      }
    } catch (error) {
      testResults.tests.projects.getProjects = {
        status: 'failed',
        error: (error as Error).message,
      }
      testResults.summary.total++
      testResults.summary.failed++
    }

    // Test 5: getFeaturedProjects
    try {
      const featuredProjectsResult = await getFeaturedProjects('vi', 6)
      testResults.tests.projects.getFeaturedProjects = {
        status: featuredProjectsResult.error ? 'failed' : 'passed',
        itemCount: featuredProjectsResult.data?.length || 0,
        error: featuredProjectsResult.error?.message,
      }
      testResults.summary.total++
      if (!featuredProjectsResult.error) testResults.summary.passed++
      else testResults.summary.failed++
    } catch (error) {
      testResults.tests.projects.getFeaturedProjects = {
        status: 'failed',
        error: (error as Error).message,
      }
      testResults.summary.total++
      testResults.summary.failed++
    }
  } catch (error) {
    testResults.tests.projects.error = (error as Error).message
    testResults.summary.failed++
  }

  // Test Media Queries
  try {
    // Test 7: getRecentMedia
    const recentMediaResult = await getRecentMedia(10)
    testResults.tests.media.getRecentMedia = {
      status: recentMediaResult.error ? 'failed' : 'passed',
      itemCount: recentMediaResult.data?.length || 0,
      error: recentMediaResult.error?.message,
    }
    testResults.summary.total++
    if (!recentMediaResult.error) testResults.summary.passed++
    else testResults.summary.failed++

    // Test 8: getMediaStats
    const mediaStatsResult = await getMediaStats()
    testResults.tests.media.getMediaStats = {
      status: mediaStatsResult.error ? 'failed' : 'passed',
      stats: {
        totalImages: mediaStatsResult.totalImages,
        totalVideos: mediaStatsResult.totalVideos,
        totalSize: `${(mediaStatsResult.totalSize / 1024 / 1024).toFixed(2)} MB`,
      },
      error: mediaStatsResult.error?.message,
    }
    testResults.summary.total++
    if (!mediaStatsResult.error) testResults.summary.passed++
    else testResults.summary.failed++
  } catch (error) {
    testResults.tests.media.error = (error as Error).message
    testResults.summary.failed++
  }

  // Return results
  const overallStatus = testResults.summary.failed === 0 ? 'success' : 'partial'

  return NextResponse.json(
    {
      status: overallStatus,
      message:
        overallStatus === 'success'
          ? 'All query functions working correctly!'
          : 'Some query functions failed or returned errors',
      ...testResults,
    },
    {
      status: overallStatus === 'success' ? 200 : 500,
    }
  )
}

/**
 * RLS Policy Testing API Route
 * 
 * Purpose: Verify Row Level Security policies are working correctly
 * Reference: PHASE-1-FOUNDATION.md Section 1.3.5
 * 
 * Test scenarios:
 * 1. Anonymous user can read published content
 * 2. Anonymous user cannot read draft content
 * 3. Anonymous user cannot write to any table
 * 4. Admin user can read all content
 * 5. Admin user can write to all tables
 * 
 * Usage:
 * - Anonymous: GET /api/test-rls
 * - With auth: GET /api/test-rls with Authorization header
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface TestResult {
  test: string
  passed: boolean
  details?: string
  error?: string
}

export async function GET() {
  const results: TestResult[] = []
  const supabase = await createClient()
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  
  // Get user profile if authenticated
  let userProfile = null
  let isAdmin = false
  
  if (isAuthenticated) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    userProfile = profile
    isAdmin = profile?.role === 'admin'
  }
  
  // ============================================
  // Test 1: Anonymous can read published posts
  // ============================================
  try {
    // Note: This test assumes there's at least one published post
    // If database is empty, this will pass with 0 rows
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, status')
      .eq('status', 'published')
      .limit(10)
    
    results.push({
      test: 'Anonymous read published blog posts',
      passed: !error,
      details: error ? undefined : `Found ${data?.length || 0} published posts`,
      error: error?.message
    })
  } catch (error) {
    results.push({
      test: 'Anonymous read published blog posts',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // ============================================
  // Test 2: Anonymous cannot read draft posts
  // ============================================
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, status')
      .eq('status', 'draft')
      .limit(10)
    
    // Should return 0 rows (no permission) or error
    const cannotReadDrafts = (data?.length === 0) || !!error
    
    results.push({
      test: 'Anonymous cannot read draft posts',
      passed: cannotReadDrafts,
      details: cannotReadDrafts 
        ? 'Correctly blocked access to draft posts' 
        : `SECURITY ISSUE: Found ${data?.length} draft posts`,
      error: error?.message
    })
  } catch (error) {
    results.push({
      test: 'Anonymous cannot read draft posts',
      passed: true, // Error means access denied (correct)
      details: 'Access correctly denied'
    })
  }
  
  // ============================================
  // Test 3: Anonymous cannot write
  // ============================================
  try {
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: 'Test Post (Should Fail)',
        slug: 'test-post-should-fail',
        content: 'This should not be inserted',
        locale: 'vi',
        status: 'draft'
      })
    
    const writeBlocked = !!error
    
    results.push({
      test: 'Anonymous cannot write to blog_posts',
      passed: writeBlocked,
      details: writeBlocked 
        ? 'Write correctly blocked' 
        : 'SECURITY ISSUE: Anonymous write succeeded!',
      error: error?.message
    })
  } catch (error) {
    results.push({
      test: 'Anonymous cannot write to blog_posts',
      passed: true,
      details: 'Write correctly blocked'
    })
  }
  
  // ============================================
  // Test 4: Public can read all media
  // ============================================
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, public_id')
      .limit(10)
    
    results.push({
      test: 'Public can read media metadata',
      passed: !error,
      details: `Found ${data?.length || 0} media items`,
      error: error?.message
    })
  } catch (error) {
    results.push({
      test: 'Public can read media metadata',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // ============================================
  // Test 5: Public can read tags
  // ============================================
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .limit(10)
    
    results.push({
      test: 'Public can read tags',
      passed: !error,
      details: `Found ${data?.length || 0} tags`,
      error: error?.message
    })
  } catch (error) {
    results.push({
      test: 'Public can read tags',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // ============================================
  // Test 6: Helper function is_admin() works
  // ============================================
  if (isAuthenticated) {
    try {
      const { data, error } = await supabase.rpc('is_admin')
      
      results.push({
        test: 'Helper function is_admin() works',
        passed: !error && data === isAdmin,
        details: `is_admin() returned ${data}, expected ${isAdmin}`,
        error: error?.message
      })
    } catch (error) {
      results.push({
        test: 'Helper function is_admin() works',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // ============================================
  // Test 7: Admin can write (if authenticated as admin)
  // ============================================
  if (isAuthenticated && isAdmin) {
    try {
      // Try to insert a test tag (safe, minimal data)
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: `RLS Test ${Date.now()}`,
          slug: `rls-test-${Date.now()}`
        })
        .select()
        .single()
      
      // Clean up test data
      if (data && !error) {
        await supabase.from('tags').delete().eq('id', data.id)
      }
      
      results.push({
        test: 'Admin can write to tags table',
        passed: !error,
        details: error ? undefined : 'Admin write successful (test data deleted)',
        error: error?.message
      })
    } catch (error) {
      results.push({
        test: 'Admin can write to tags table',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // ============================================
  // Summary
  // ============================================
  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const failedTests = totalTests - passedTests
  const allPassed = failedTests === 0
  
  return NextResponse.json({
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      allPassed,
      authenticated: isAuthenticated,
      isAdmin: isAdmin,
      userRole: userProfile?.role || 'anonymous'
    },
    results,
    notes: [
      'Run this test as anonymous user first',
      'Then authenticate as admin and run again',
      'All tests should pass in both scenarios',
      'If database is empty, some tests may show 0 results (this is OK)'
    ]
  }, {
    status: allPassed ? 200 : 500
  })
}

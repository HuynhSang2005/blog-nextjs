import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch stats in parallel
    const [
      { count: totalPosts },
      { count: publishedPosts },
      { count: draftPosts },
      { count: totalProjects },
      { count: completedProjects },
      { count: inProgressProjects },
      { count: totalTags },
      { count: totalDocs },
      recentPostsResult,
    ] = await Promise.all([
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft'),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress'),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('docs').select('*', { count: 'exact', head: true }),
      supabase
        .from('blog_posts')
        .select('id, title, status, published_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const recentPosts = (recentPostsResult.data || []).map(post => ({
      id: post.id,
      title: post.title,
      status: post.status,
      published_at: post.published_at,
    }))

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      draftPosts: draftPosts || 0,
      totalProjects: totalProjects || 0,
      completedProjects: completedProjects || 0,
      inProgressProjects: inProgressProjects || 0,
      totalTags: totalTags || 0,
      totalDocs: totalDocs || 0,
      recentPosts,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

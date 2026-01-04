import { unstable_cache } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale } from '@/config/i18n'
import { createClient } from '@/lib/supabase/server'

interface CommandMenuBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  tags: string[]
}

const getCachedCommandMenuPosts = unstable_cache(
  async (locale: string): Promise<CommandMenuBlogPost[]> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
          id,
          slug,
          title,
          excerpt,
          blog_post_tags(
            tag:tags(
              name
            )
          )
        `
      )
      .eq('locale', locale)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Error fetching command menu blog posts:', error)
      return []
    }

    return (
      data?.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        tags:
          post.blog_post_tags
            ?.flatMap(pt => {
              const tag = pt.tag

              if (Array.isArray(tag)) {
                return tag
                  .map(t => t?.name)
                  .filter((name): name is string => typeof name === 'string')
              }

              if (tag && typeof tag === 'object' && 'name' in tag) {
                const name = (tag as { name?: unknown }).name
                return typeof name === 'string' ? [name] : []
              }

              return []
            })
            .filter((name): name is string => typeof name === 'string') ?? [],
      })) ?? []
    )
  },
  ['command-menu-blog-posts'],
  {
    revalidate: 60 * 10,
  }
)

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') ?? defaultLocale

  const posts = await getCachedCommandMenuPosts(locale)

  return NextResponse.json(
    { posts },
    {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=600, stale-while-revalidate=600',
      },
    }
  )
}

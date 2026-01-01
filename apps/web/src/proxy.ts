import { type NextRequest, NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'
import proxyImpl from '@/lib/core/proxy'
import { defaultLocale, locales } from '@/config/i18n'

/**
 * Proxy để xử lý:
 * 1. Authentication check cho admin routes
 * 2. I18n routing (delegate to proxyImpl)
 *
 * Note: Next.js 16 đã đổi tên middleware → proxy
 */
export default async function proxy(request: NextRequest) {
  // Get custom admin path from environment or use default
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
  const pathname = request.nextUrl.pathname

  // Enforce locale prefix for admin routes (next-intl middleware is bypassed below).
  // Without this, `/admin` is treated as locale="admin" and breaks routing.
  const firstSegment = pathname.split('/')[1] || ''
  const hasLocalePrefix = locales.includes(
    firstSegment as (typeof locales)[number]
  )
  const isAdminRoute = pathname.includes(adminPath)
  if (isAdminRoute && !hasLocalePrefix) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    )
  }

  // Initialize response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for proxy
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies
          .getAll()
          .map(({ name, value }) => ({ name, value }))
      },
      setAll(
        cookiesToSet: Array<{
          name: string
          value: string
          options: CookieOptions
        }>
      ) {
        // Create a fresh response so Set-Cookie headers are preserved.
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })

        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        }
      },
    },
  })

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If accessing admin route
  if (isAdminRoute) {
    // Not authenticated -> redirect to login
    if (!session) {
      // Preserve locale in login redirect
      const locale = pathname.split('/')[1] || 'vi'
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Authenticated -> check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Not admin -> return 403
    if (profile?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Admin user -> allow access
    return response
  }

  // Redirect old /admin to custom admin path (if different)
  if (pathname === '/admin' && adminPath !== '/admin') {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${adminPath}`, request.url)
    )
  }

  // For non-admin routes, delegate to i18n proxy
  return proxyImpl(request)
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_proxy/|_vercel|_static|favicon.ico|sitemap.xml|blog.xml|blog.json|robots.txt|.*\\..*).*)',
    '/([\\w-]+)?/(docs|blog)/(.+)',
  ],
}

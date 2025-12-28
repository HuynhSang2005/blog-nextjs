import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import proxyImpl from '@/lib/core/proxy'

/**
 * Middleware để xử lý:
 * 1. Authentication check cho admin routes
 * 2. I18n routing (delegate to proxyImpl)
 */
export async function middleware(request: NextRequest) {
  // Get custom admin path from environment or use default
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
  const pathname = request.nextUrl.pathname

  // Initialize response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if accessing admin route (including locale prefix like /vi/admin)
  const isAdminRoute = pathname.includes(adminPath)

  // If accessing admin route
  if (isAdminRoute) {
    // Not authenticated -> redirect to login
    if (!session) {
      const loginUrl = new URL('/login', request.url)
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
    return NextResponse.redirect(new URL(adminPath, request.url))
  }

  // For non-admin routes, delegate to i18n proxy
  return proxyImpl(request)
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!api/|_next/|_proxy/|_vercel|_static|favicon.ico|sitemap.xml|blog.xml|blog.json|robots.txt|.*\\..*).*)',
    // Match docs and blog routes with locale
    '/([\\w-]+)?/(docs|blog)/(.+)',
  ],
}

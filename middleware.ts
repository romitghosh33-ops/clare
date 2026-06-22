import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/products', '/sellers', '/search', '/pricing']
const AUTH_PATHS = ['/login', '/register']
const ADMIN_PATHS = ['/admin']
const SELLER_PATHS = ['/seller']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Redirect logged-in users away from auth pages
  if (user && AUTH_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // Protect admin routes
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && pathname !== '/admin/login') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }
  }

  // Protect seller routes
  if (SELLER_PATHS.some(p => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url))
    }
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!seller) {
      return NextResponse.redirect(new URL('/seller/onboarding', request.url))
    }
    if (seller.status === 'pending') {
      return NextResponse.redirect(new URL('/seller/pending', request.url))
    }
    if (seller.status === 'suspended' || seller.status === 'rejected') {
      return NextResponse.redirect(new URL('/seller/suspended', request.url))
    }
  }

  // Protect buyer account routes
  if (pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
